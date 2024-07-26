import type { NoInfer, SafeAny } from "../types";
import { createId } from "../utils/createId";
import { RPC_MESSAGE_TIMEOUT } from "./errorMessages";
import { deserializeError, serializeError } from "./errorSerialization";
import type { MessageAdapter } from "./messageAdapters";
import type { RPCRequestMessage, RPCResponseMessage } from "./messages";
import {
  MessageType,
  isRPCRequestMessage,
  isRPCResponseMessage,
} from "./messages";

type MessageCollection = Record<string, (...parameters: SafeAny[]) => SafeAny>;

export interface RpcClient<Messages extends MessageCollection> {
  readonly timeout: number;
  withTimeout: (timeoutMs: number) => RpcClient<Messages>;
  request: <TName extends keyof Messages & string>(
    name: TName,
    ...params: Parameters<Messages[TName]>
  ) => Promise<Awaited<ReturnType<Messages[TName]>>>;
}

const DEFAULT_TIMEOUT = 30_000;

export function createRpcClient<Messages extends MessageCollection>(
  adapter: MessageAdapter<RPCRequestMessage>
): RpcClient<Messages> {
  return {
    timeout: DEFAULT_TIMEOUT,
    withTimeout(timeoutMs) {
      return { ...this, timeout: timeoutMs };
    },
    request(name, ...params) {
      return new Promise<SafeAny>((resolve, reject) => {
        const id = createId();

        const timeout = setTimeout(() => {
          removeListener();
          reject(new Error(RPC_MESSAGE_TIMEOUT));
        }, this.timeout);

        const removeListener = adapter.addListener((message) => {
          if (!isRPCResponseMessage(message) || message.sourceId !== id) {
            return;
          }

          if ("error" in message) {
            reject(deserializeError(message.error));
          } else {
            resolve(message.result);
          }

          clearTimeout(timeout);
          removeListener();
        });

        adapter.postMessage({
          source: "apollo-client-devtools",
          type: MessageType.RPCRequest,
          id,
          name,
          params,
        });
      });
    },
  };
}

export function createRpcHandler<Messages extends MessageCollection>(
  adapter: MessageAdapter<RPCResponseMessage>
) {
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

  return function <TName extends keyof Messages & string>(
    name: TName,
    handler: (
      ...params: Parameters<Messages[TName]>
    ) =>
      | NoInfer<Awaited<ReturnType<Messages[TName]>>>
      | Promise<NoInfer<Awaited<ReturnType<Messages[TName]>>>>
  ) {
    if (listeners.has(name)) {
      throw new Error("Only one rpc handler can be registered per type");
    }

    listeners.set(name, async ({ id, params }) => {
      try {
        const result = await Promise.resolve(
          handler(...(params as Parameters<Messages[TName]>))
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

    return () => {
      listeners.delete(name);

      if (listeners.size === 0) {
        stopListening();
      }
    };
  };
}
