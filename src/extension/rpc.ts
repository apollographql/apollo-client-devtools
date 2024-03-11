import { SafeAny } from "../types";
import { MessageAdapter } from "./messageAdapters";
import {
  ApolloClientDevtoolsRPCMessage,
  MessageType,
  isRPCMessage,
} from "./messages";

type RPCParams = Record<string, unknown>;

type RPCRequestMessageFormat = {
  type: string;
  params: RPCParams;
};

type RPCResponseMessageFormat =
  | { sourceId: number; result: unknown }
  | { sourceId: number; error: unknown };

export type RPC<Name extends string, Params extends RPCParams, ReturnType> = {
  __name: Name;
  __params: Params;
  __returnType: ReturnType;
};

export interface RpcClient<Messages extends RPC<string, RPCParams, SafeAny>> {
  request: <TName extends Messages["__name"]>(
    name: TName,
    params: Extract<Messages, { __name: TName }>["__params"],
    options?: { timeoutMs?: number }
  ) => Promise<Extract<Messages, { __name: TName }>["__returnType"]>;
}

let nextMessageId = 0;
const DEFAULT_TIMEOUT = 30_000;

export function createRpcClient<
  Messages extends RPC<string, RPCParams, SafeAny>,
>(
  adapter: MessageAdapter<
    ApolloClientDevtoolsRPCMessage<RPCRequestMessageFormat>
  >
): RpcClient<Messages> {
  return {
    request: (name, params, options) => {
      return Promise.race([
        new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Timeout waiting for message")),
            options?.timeoutMs ?? DEFAULT_TIMEOUT
          );
        }),
        new Promise((resolve, reject) => {
          const id = ++nextMessageId;

          const removeListener = adapter.addListener((message) => {
            if (
              isRPCMessage(message) &&
              "sourceId" in message.message &&
              message.message.sourceId === id
            ) {
              if ("error" in message.message) {
                reject(message.message.error);
              } else {
                resolve(message.message.result);
              }

              removeListener();
            }
          });

          adapter.postMessage({
            source: "apollo-client-devtools",
            type: MessageType.RPC,
            id,
            message: { type: name, params },
          });
        }),
      ]);
    },
  };
}

export function createRpcHandler<
  Messages extends RPC<string, RPCParams, SafeAny>,
>(
  adapter: MessageAdapter<
    ApolloClientDevtoolsRPCMessage<RPCResponseMessageFormat>
  >
) {
  const listeners = new Map<
    string,
    (
      message: ApolloClientDevtoolsRPCMessage<{
        type: string;
        params: RPCParams;
      }>
    ) => void
  >();
  let removeListener: (() => void) | null = null;

  function handleMessage(message: unknown) {
    if (isRPCMessage<{ type: string; params: RPCParams }>(message)) {
      listeners.get(message.message.type)?.(message);
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

  return function <
    TName extends Messages["__name"],
    TReturnType = Extract<Messages, { __name: TName }>["__returnType"],
  >(
    name: TName,
    execute: (
      params: Extract<Messages, { __name: TName }>["__params"]
    ) => TReturnType | Promise<TReturnType>
  ) {
    if (listeners.has(name)) {
      throw new Error("Only one rpc handler can be registered per type");
    }

    listeners.set(name, async ({ id, message }) => {
      try {
        const result = await Promise.resolve(execute(message.params));

        adapter.postMessage({
          source: "apollo-client-devtools",
          type: MessageType.RPC,
          id: ++nextMessageId,
          message: { sourceId: id, result },
        });
      } catch (error) {
        adapter.postMessage({
          source: "apollo-client-devtools",
          type: MessageType.RPC,
          id: ++nextMessageId,
          message: { sourceId: id, error },
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
