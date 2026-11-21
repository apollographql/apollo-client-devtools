import type { JSONObject } from "../application/types/json";
import type { ApolloClientInfo, ErrorCodes, NoInfer, SafeAny } from "@/types";
import { createId } from "../utils/createId";
import { RPC_MESSAGE_TIMEOUT } from "./errorMessages";
import { deserializeError, serializeError } from "./errorSerialization";
import type { MessageAdapter } from "./messageAdapters";
import type { MessageTarget } from "./messages";
import { MessageType } from "./messages";
import type {
  MutationV3Details,
  QueryV3Details,
  MemoryInternalsV3,
} from "./tab/v3/types";
import type {
  MutationV4Details,
  QueryV4Details,
  MemoryInternalsV4,
} from "./tab/v4/types";
import type { CacheWrite } from "./tab/shared/types";
import { createActor } from "./actor";

// Symbol to indicate a handler should not send a response (for multi-frame support)
export const SKIP_RESPONSE = Symbol("SKIP_RESPONSE");

export type RPCRequest = {
  getClients(): ApolloClientInfo[];
  getClient(): ApolloClientInfo | null;
  getV3Queries(): QueryV3Details[];
  getV4Queries(): QueryV4Details[];
  getV3Mutations(): MutationV3Details[];
  getV4Mutations(): MutationV4Details[];
  getCache(): JSONObject;
  getErrorCodes(version: string): Promise<ErrorCodes | undefined>;
  getV3MemoryInternals(): MemoryInternalsV3 | undefined;
  getV4MemoryInternals(): MemoryInternalsV4 | undefined;
};

export interface RPCStream {
  cacheWrite(): CacheWrite;
}

export interface RpcClient {
  readonly timeout: number;
  readonly signal?: AbortSignal;
  readonly target?: MessageTarget;
  withClientId: (clientId: string) => RpcClient;
  withTimeout: (timeoutMs: number) => RpcClient;
  withSignal: (abortSignal?: AbortSignal) => RpcClient;
  request: <TName extends keyof RPCRequest & string>(
    name: TName,
    ...params: Parameters<RPCRequest[TName]>
  ) => Promise<Awaited<ReturnType<RPCRequest[TName]>>>;
  stream: <TName extends keyof RPCStream & string>(
    name: TName,
    ...params: Parameters<RPCStream[TName]>
  ) => ReadableStream<ReturnType<RPCStream[TName]>>;
}

interface RPCErrorResponseMessage {
  type: MessageType.RPCResponse;
  sourceId: string;
  error: { name?: string; message: string; stack?: string };
}

interface RPCSuccessResponseMessage<Result = unknown> {
  type: MessageType.RPCResponse;
  sourceId: string;
  result: Result;
}

export interface RPCRequestMessage<Params extends SafeAny[] = unknown[]> {
  type: MessageType.RPCRequest;
  id: string;
  name: string;
  params: Params;
}

export interface RPCStreamStartMessage<Params extends any[] = unknown[]> {
  type: MessageType.RPCStartStream;
  id: string;
  name: string;
  params: Params;
}

export interface RPCTerminateStreamMessage {
  type: MessageType.RPCTerminateStream;
  streamId: string;
}

export interface RPCStreamChunkMessage<Value = unknown> {
  type: MessageType.RPCStreamChunk;
  streamId: string;
  value: Value;
}

export type RPCResponseMessage<Result = unknown> =
  | RPCSuccessResponseMessage<Result>
  | RPCErrorResponseMessage;

const DEFAULT_TIMEOUT = 30_000;

export function createRpcClient(adapter: MessageAdapter): RpcClient {
  return {
    timeout: DEFAULT_TIMEOUT,
    withClientId(clientId) {
      return { ...this, target: { type: "client", clientId } };
    },
    withTimeout(timeoutMs) {
      return { ...this, timeout: timeoutMs };
    },
    withSignal(signal?: AbortSignal) {
      return { ...this, signal };
    },
    request(name, ...params) {
      const { target, signal } = this;

      if (signal?.aborted) {
        return Promise.reject(getAbortError(signal));
      }

      return new Promise<SafeAny>((resolve, reject) => {
        const id = createId();

        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error(RPC_MESSAGE_TIMEOUT));
        }, this.timeout);

        function handleAbort() {
          cleanup();
          reject(getAbortError(signal!));
        }

        function cleanup() {
          clearTimeout(timeout);
          removeListener();
          signal?.removeEventListener("abort", handleAbort);
        }

        const removeListener = adapter.addListener((message) => {
          if (
            message.type === MessageType.PostMessageError &&
            message.sourceId === id
          ) {
            reject(deserializeError(message.error));
            return cleanup();
          }

          if (
            message.type !== MessageType.RPCResponse ||
            message.sourceId !== id
          ) {
            return;
          }

          if ("error" in message) {
            reject(deserializeError(message.error));
          } else {
            resolve(message.result);
          }

          cleanup();
        });

        signal?.addEventListener("abort", handleAbort, { once: true });

        adapter.postMessage(
          {
            type: MessageType.RPCRequest,
            id,
            name,
            params,
          },
          target
        );
      });
    },
    stream(name, ...params) {
      const streamId = createId();
      const { signal } = this;
      let removeListener!: () => void;

      function cleanup() {
        removeListener();
        adapter.postMessage({
          type: MessageType.RPCTerminateStream,
          streamId,
        });
      }

      return new ReadableStream({
        start: (controller) => {
          if (signal?.aborted) {
            return controller.close();
          }

          removeListener = adapter.addListener((message) => {
            if (
              message.type === MessageType.RPCTerminateStream &&
              message.streamId === streamId
            ) {
              removeListener();
              return controller.close();
            }

            if (
              message.type === MessageType.RPCStreamChunk &&
              message.streamId === streamId
            ) {
              controller.enqueue(message.value as any);
            }
          });

          adapter.postMessage({
            type: MessageType.RPCStartStream,
            id: streamId,
            name,
            params,
          });

          if (signal) {
            signal.addEventListener(
              "abort",
              () => {
                cleanup();
                controller.close();
              },
              { once: true }
            );
          }
        },
        cancel: cleanup,
      });
    },
  };
}

export function createRpcHandler(adapter: MessageAdapter) {
  const listeners = new Set<string>();

  return function <TName extends keyof RPCRequest & string>(
    name: TName,
    handler: (
      ...params: Parameters<RPCRequest[TName]>
    ) =>
      | NoInfer<Awaited<ReturnType<RPCRequest[TName]>>>
      | Promise<NoInfer<Awaited<ReturnType<RPCRequest[TName]>>>>,
    options: { signal?: AbortSignal } = {}
  ) {
    if (listeners.has(name)) {
      throw new Error("Only one rpc handler can be registered per type");
    }

    listeners.add(name);

    const unsubscribe = adapter.on(MessageType.RPCRequest, async (message) => {
      if (message.name !== name) {
        return;
      }

      const { id, params } = message;

      try {
        const result = await Promise.resolve(
          handler(...(params as Parameters<RPCRequest[TName]>))
        );

        // If handler returns SKIP_RESPONSE, don't send a response
        // This is used for multi-frame support where only frames with clients should respond
        if (result === SKIP_RESPONSE) {
          return;
        }

        adapter.postMessage(
          {
            type: MessageType.RPCResponse,
            sourceId: id,
            result,
          },
          message.target
        );
      } catch (e) {
        adapter.postMessage(
          {
            type: MessageType.RPCResponse,
            sourceId: id,
            error: serializeError(e),
          },
          message.target
        );
      }
    });

    const cleanup = () => {
      listeners.delete(name);
      unsubscribe();
    };

    options.signal?.addEventListener("abort", cleanup, { once: true });

    return cleanup;
  };
}

export function createRpcStreamHandler(adapter: MessageAdapter) {
  const actor = createActor(adapter);
  const listeners = new Set<string>();

  // In case messages in the stream get pushed very fast, we want to keep the
  // source app fast so we process the messages async
  const messageQueue: RPCStreamChunkMessage[] = [];

  function processQueue() {
    if (!messageQueue.length) {
      return;
    }

    requestIdleCallback(() => {
      const message = messageQueue.shift();

      if (message) {
        adapter.postMessage(message);
      }

      processQueue();
    });
  }

  function postMessage(message: RPCStreamChunkMessage) {
    messageQueue.push(message);
    processQueue();
  }

  return function <TName extends keyof RPCStream & string>(
    name: TName,
    handler: (
      controller: {
        push: (value: ReturnType<RPCStream[TName]>) => void;
        close: () => void;
      },
      ...params: Parameters<RPCStream[TName]>
    ) => (() => void) | void,
    options: { signal?: AbortSignal } = {}
  ) {
    if (listeners.has(name)) {
      throw new Error("Only one rpc handler can be registered per type");
    }

    listeners.add(name);

    const cleanupFnsByStreamId = new Map<string, () => void>();

    const cleanupAll = () => {
      cleanupFnsByStreamId.forEach((cleanup) => cleanup());
    };

    const unsubscribeDisconnected = actor.on(
      "devtoolsDisconnected",
      cleanupAll
    );

    const unsubscribeTerminate = adapter.on(
      MessageType.RPCTerminateStream,
      ({ streamId }) => {
        cleanupFnsByStreamId.get(streamId)?.();
      }
    );

    const unsubscribeStream = adapter.on(
      MessageType.RPCStartStream,
      (message) => {
        if (message.name !== name) return;

        const { id: streamId, params } = message;
        let closed = false;

        function push(value: ReturnType<RPCStream[TName]>) {
          if (closed) {
            return;
          }

          postMessage({ type: MessageType.RPCStreamChunk, streamId, value });
        }

        function close() {
          if (closed) {
            return;
          }

          cleanupFnsByStreamId.get(streamId)?.();
          adapter.postMessage({
            type: MessageType.RPCTerminateStream,
            streamId,
          });
        }

        let cleanup: (() => void) | void = undefined;
        cleanupFnsByStreamId.set(streamId, () => {
          closed = true;
          cleanup?.();
          cleanupFnsByStreamId.delete(streamId);
        });

        cleanup = handler(
          { push, close },
          ...(params as Parameters<RPCStream[TName]>)
        );

        if (closed) cleanup?.();
      }
    );

    const cleanup = () => {
      cleanupAll();
      listeners.delete(name);
      unsubscribeStream();
      unsubscribeDisconnected();
      unsubscribeTerminate();
    };
    options.signal?.addEventListener("abort", cleanup, { once: true });
    return cleanup;
  };
}

function getAbortError(signal: AbortSignal) {
  const { reason } = signal;

  return reason instanceof DOMException
    ? reason
    : new DOMException(reason, "AbortError");
}
