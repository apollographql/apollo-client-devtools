import type { JSONObject } from "../application/types/json";
import type { ApolloClientInfo, ErrorCodes, NoInfer, SafeAny } from "@/types";
import { createId } from "../utils/createId";
import { RPC_MESSAGE_TIMEOUT } from "./errorMessages";
import { deserializeError, serializeError } from "./errorSerialization";
import type { MessageAdapter } from "./messageAdapters";
import { MessageType, isDevtoolsMessage, isPostMessageError } from "./messages";
import type { IDv3, IDv4 } from "./tab/clientHandler";
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

export type RPCRequest = {
  getClients(): ApolloClientInfo[];
  getClient(id: string): ApolloClientInfo | null;
  getV3Queries(clientId: IDv3): QueryV3Details[];
  getV4Queries(clientId: IDv4): QueryV4Details[];
  getV3Mutations(clientId: IDv3): MutationV3Details[];
  getV4Mutations(clientId: IDv4): MutationV4Details[];
  getCache(clientId: string): JSONObject;
  getErrorCodes(version: string): Promise<ErrorCodes | undefined>;
  getV3MemoryInternals(clientId: IDv3): MemoryInternalsV3 | undefined;
  getV4MemoryInternals(clientId: IDv4): MemoryInternalsV4 | undefined;
};

export type RPCStream = {
  cacheWrite(clientId: IDv3 | IDv4): CacheWrite;
};

export interface RpcClient {
  readonly timeout: number;
  readonly signal?: AbortSignal;
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

type RPCErrorResponseMessage = {
  source: "apollo-client-devtools";
  type: MessageType.RPCResponse;
  id: string;
  sourceId: string;
  error: { name?: string; message: string; stack?: string };
};

type RPCSuccessResponseMessage<Result = unknown> = {
  source: "apollo-client-devtools";
  type: MessageType.RPCResponse;
  id: string;
  sourceId: string;
  result: Result;
};

export type RPCRequestMessage<Params extends SafeAny[] = unknown[]> = {
  source: "apollo-client-devtools";
  type: MessageType.RPCRequest;
  id: string;
  name: string;
  params: Params;
};

export type RPCStreamStartMessage<Params extends any[] = unknown[]> = {
  source: "apollo-client-devtools";
  type: MessageType.RPCStartStream;
  id: string;
  name: string;
  params: Params;
};

export type RPCTerminateStreamMessage = {
  source: "apollo-client-devtools";
  type: MessageType.RPCTerminateStream;
  id: string;
  streamId: string;
};

export type RPCStreamChunkMessage<Value = unknown> = {
  source: "apollo-client-devtools";
  type: MessageType.RPCStreamChunk;
  id: string;
  streamId: string;
  value: Value;
};

export type RPCResponseMessage<Result = unknown> =
  | RPCSuccessResponseMessage<Result>
  | RPCErrorResponseMessage;

const DEFAULT_TIMEOUT = 30_000;

export function createRpcClient(adapter: MessageAdapter): RpcClient {
  return {
    timeout: DEFAULT_TIMEOUT,
    withTimeout(timeoutMs) {
      return { ...this, timeout: timeoutMs };
    },
    withSignal(signal?: AbortSignal) {
      return { ...this, signal };
    },
    request(name, ...params) {
      const { signal } = this;

      if (signal?.aborted) {
        return Promise.reject(getAbortError(signal));
      }

      return new Promise<SafeAny>((resolve, reject) => {
        const id = createId();

        const timeout = setTimeout(() => {
          removeListener();
          reject(new Error(RPC_MESSAGE_TIMEOUT));
        }, this.timeout);

        const removeListener = adapter.addListener((message) => {
          function cleanup() {
            clearTimeout(timeout);
            removeListener();
          }

          if (isPostMessageError(message) && message.sourceId === id) {
            reject(deserializeError(message.error));
            return cleanup();
          }

          if (!isRPCResponseMessage(message) || message.sourceId !== id) {
            return;
          }

          if ("error" in message) {
            reject(deserializeError(message.error));
          } else {
            resolve(message.result);
          }

          cleanup();
        });

        if (signal) {
          signal.addEventListener("abort", () => {
            clearTimeout(timeout);
            removeListener();
            reject(getAbortError(signal));
          });
        }

        adapter.postMessage({
          source: "apollo-client-devtools",
          type: MessageType.RPCRequest,
          id,
          name,
          params,
        });
      });
    },
    stream(name, ...params) {
      const streamId = createId();
      const { signal } = this;
      let removeListener!: () => void;

      function cleanup() {
        removeListener();
        adapter.postMessage({
          source: "apollo-client-devtools",
          type: MessageType.RPCTerminateStream,
          id: createId(),
          streamId,
        });
      }

      return new ReadableStream({
        start: (controller) => {
          removeListener = adapter.addListener((message) => {
            if (
              !isRPCStreamChunkMessage(message) ||
              message.streamId !== streamId
            ) {
              return;
            }

            controller.enqueue(message.value as any);
          });

          adapter.postMessage({
            source: "apollo-client-devtools",
            type: MessageType.RPCStartStream,
            id: streamId,
            name,
            params,
          });

          function cleanup() {
            adapter.postMessage({
              source: "apollo-client-devtools",
              type: MessageType.RPCTerminateStream,
              id: createId(),
              streamId,
            });
            controller.close();
            removeListener();
          }

          if (signal) {
            signal.addEventListener(
              "abort",
              () => {
                controller.close();
                cleanup();
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
  const listeners = new Map<string, (message: RPCRequestMessage) => void>();
  let removeListener: (() => void) | null = null;

  function handleMessage(message: unknown) {
    if (isRPCRequestMessage(message)) {
      listeners.get(message.name)?.(message);
    }
  }

  function startListening() {
    if (!removeListener) {
      removeListener = adapter.addListener(handleMessage);
    }
  }

  function stopListening() {
    if (removeListener) {
      removeListener();
      removeListener = null;
    }
  }

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

    listeners.set(name, async ({ id, params }) => {
      try {
        const result = await Promise.resolve(
          handler(...(params as Parameters<RPCRequest[TName]>))
        );

        adapter.postMessage({
          source: "apollo-client-devtools",
          type: MessageType.RPCResponse,
          id: createId(),
          sourceId: id,
          result,
        });
      } catch (e) {
        adapter.postMessage({
          source: "apollo-client-devtools",
          type: MessageType.RPCResponse,
          id: createId(),
          sourceId: id,
          error: serializeError(e),
        });
      }
    });

    startListening();

    const cleanup = () => {
      listeners.delete(name);

      if (listeners.size === 0) {
        stopListening();
      }
    };
    if (options.signal) {
      options.signal.addEventListener("abort", cleanup, { once: true });
    }
    return cleanup;
  };
}

export function createRpcStreamHandler(adapter: MessageAdapter) {
  const listeners = new Map<string, (message: RPCStreamStartMessage) => void>();
  const cleanupFnsByStreamId = new Map<string, () => void>();
  const streamIdsByName = new Map<string, Set<string>>();
  let removeListener: (() => void) | null = null;

  function handleMessage(message: unknown) {
    if (isRPCStartStreamMessage(message)) {
      listeners.get(message.name)?.(message);
    }

    if (isRPCTerminateStreamMessage(message)) {
      cleanupFnsByStreamId.get(message.streamId)?.();
    }
  }

  function startListening() {
    if (!removeListener) {
      removeListener = adapter.addListener(handleMessage);
    }
  }

  function stopListening() {
    if (removeListener) {
      removeListener();
      removeListener = null;
    }
  }

  return function <TName extends keyof RPCStream & string>(
    name: TName,
    handler: (
      push: (value: ReturnType<RPCStream[TName]>) => void,
      ...params: Parameters<RPCStream[TName]>
    ) => (() => void) | void,
    options: { signal?: AbortSignal } = {}
  ) {
    if (listeners.has(name)) {
      throw new Error("Only one rpc handler can be registered per type");
    }

    streamIdsByName.set(name, new Set());

    listeners.set(name, async ({ id, params }) => {
      streamIdsByName.get(name)!.add(id);

      function push(value: ReturnType<RPCStream[TName]>) {
        adapter.postMessage({
          source: "apollo-client-devtools",
          type: MessageType.RPCStreamChunk,
          id: createId(),
          streamId: id,
          value,
        });
      }

      const cleanup = handler(
        push,
        ...(params as Parameters<RPCStream[TName]>)
      );

      cleanupFnsByStreamId.set(id, () => {
        cleanup?.();
        streamIdsByName.get(name)!.delete(id);
        cleanupFnsByStreamId.delete(id);
      });
    });

    startListening();

    const cleanup = () => {
      streamIdsByName.get(name)?.forEach((streamId) => {
        cleanupFnsByStreamId.get(streamId)?.();
      });
      listeners.delete(name);

      if (listeners.size === 0) {
        stopListening();
      }
    };
    if (options.signal) {
      options.signal.addEventListener("abort", cleanup, { once: true });
    }
    return cleanup;
  };
}

export function isRPCRequestMessage(
  message: unknown
): message is RPCRequestMessage {
  return isDevtoolsMessage(message) && message.type === MessageType.RPCRequest;
}

function isRPCResponseMessage(message: unknown): message is RPCResponseMessage {
  return isDevtoolsMessage(message) && message.type === MessageType.RPCResponse;
}

export function isRPCStartStreamMessage(
  message: unknown
): message is RPCStreamStartMessage {
  return (
    isDevtoolsMessage(message) && message.type === MessageType.RPCStartStream
  );
}

export function isRPCTerminateStreamMessage(
  message: unknown
): message is RPCTerminateStreamMessage {
  return (
    isDevtoolsMessage(message) &&
    message.type === MessageType.RPCTerminateStream
  );
}

function isRPCStreamChunkMessage(
  message: unknown
): message is RPCStreamChunkMessage {
  return (
    isDevtoolsMessage(message) && message.type === MessageType.RPCStreamChunk
  );
}

function getAbortError(signal: AbortSignal) {
  const { reason } = signal;

  return reason instanceof DOMException
    ? reason
    : new DOMException(reason, "AbortError");
}
