import type { NoInfer, SafeAny } from "../types";
import type { MessageAdapter } from "./messageAdapters";
import type { ApolloClientDevtoolsRPCMessage } from "./messages";
import { MessageType, isRPCMessage } from "./messages";

type RPCParams = Record<string, unknown>;

type RPCRequestMessageFormat = {
  type: string;
  params: RPCParams;
};

type RPCResponseMessageFormat =
  | { sourceId: number; result: unknown }
  | { sourceId: number; error: unknown };

type MessageCollection = Record<string, (...parameters: [SafeAny]) => SafeAny>;

export interface RpcClient<Messages extends MessageCollection> {
  request: <TName extends keyof Messages & string>(
    name: TName,
    params: Parameters<Messages[TName]>[0],
    options?: { timeoutMs?: number }
  ) => Promise<Awaited<ReturnType<Messages[TName]>>>;
}

let nextMessageId = 0;
const DEFAULT_TIMEOUT = 30_000;

export function createRpcClient<Messages extends MessageCollection>(
  adapter: MessageAdapter<
    ApolloClientDevtoolsRPCMessage<RPCRequestMessageFormat>
  >
): RpcClient<Messages> {
  return {
    request: (name, params, options) => {
      return Promise.race([
        new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error("Timeout waiting for message")),
            options?.timeoutMs ?? DEFAULT_TIMEOUT
          );
        }),
        new Promise<SafeAny>((resolve, reject) => {
          const id = ++nextMessageId;

          const removeListener = adapter.addListener((message) => {
            if (
              isRPCMessage(message) &&
              "sourceId" in message.payload &&
              message.payload.sourceId === id
            ) {
              if ("error" in message.payload) {
                reject(message.payload.error);
              } else {
                resolve(message.payload.result);
              }

              removeListener();
            }
          });

          adapter.postMessage({
            source: "apollo-client-devtools",
            type: MessageType.RPC,
            id,
            payload: { type: name, params },
          });
        }),
      ]);
    },
  };
}

export function createRpcHandler<Messages extends MessageCollection>(
  adapter: MessageAdapter<
    ApolloClientDevtoolsRPCMessage<RPCResponseMessageFormat>
  >
) {
  const listeners = new Map<
    string,
    (message: ApolloClientDevtoolsRPCMessage<RPCRequestMessageFormat>) => void
  >();
  let removeListener: (() => void) | null = null;

  function handleMessage(message: unknown) {
    if (isRPCMessage<{ type: string; params: RPCParams }>(message)) {
      listeners.get(message.payload.type)?.(message);
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
    execute: (
      params: Parameters<Messages[TName]>[0]
    ) =>
      | NoInfer<Awaited<ReturnType<Messages[TName]>>>
      | Promise<NoInfer<Awaited<ReturnType<Messages[TName]>>>>
  ) {
    if (listeners.has(name)) {
      throw new Error("Only one rpc handler can be registered per type");
    }

    listeners.set(name, async ({ id, payload }) => {
      try {
        const result = await Promise.resolve(execute(payload.params));

        adapter.postMessage({
          source: "apollo-client-devtools",
          type: MessageType.RPC,
          id: ++nextMessageId,
          payload: { sourceId: id, result },
        });
      } catch (error) {
        adapter.postMessage({
          source: "apollo-client-devtools",
          type: MessageType.RPC,
          id: ++nextMessageId,
          payload: { sourceId: id, error },
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

export function createRPCBridge(
  adapter1: MessageAdapter<
    ApolloClientDevtoolsRPCMessage<Record<string, unknown>>
  >,
  adapter2: MessageAdapter<
    ApolloClientDevtoolsRPCMessage<Record<string, unknown>>
  >
) {
  const removeListener1 = adapter1.addListener((message) => {
    if (isRPCMessage(message)) {
      adapter2.postMessage(message);
    }
  });

  const removeListener2 = adapter2.addListener((message) => {
    if (isRPCMessage(message)) {
      adapter1.postMessage(message);
    }
  });

  return () => {
    removeListener1();
    removeListener2();
  };
}
