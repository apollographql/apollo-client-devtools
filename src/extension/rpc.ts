import { SafeAny } from "../types";
import { MessageAdapter } from "./messageAdapters";
import {
  ApolloClientDevtoolsMessage,
  isApolloClientDevtoolsMessage,
} from "./messages";

type RPCParams = Record<string, unknown>;

export type RPC<Name extends string, Params extends RPCParams, ReturnType> = {
  __name: Name;
  __params: Params;
  __returnType: ReturnType;
};

export interface RpcClient<Messages extends RPC<string, RPCParams, SafeAny>> {
  request: <TName extends Messages["__name"]>(
    name: TName,
    params: Extract<Messages, { __name: TName }>["__params"]
  ) => Promise<Extract<Messages, { __name: TName }>["__returnType"]>;
}

export function createRpcClient<
  Messages extends RPC<string, RPCParams, SafeAny>,
>(adapter: MessageAdapter): RpcClient<Messages> {
  let messageId = 0;

  return {
    request: (name, params) => {
      return new Promise((resolve) => {
        const id = ++messageId;

        const removeListener = adapter.addListener((message) => {
          if (isApolloClientDevtoolsMessage(message) && message.id === id) {
            resolve(message.message.result);
            removeListener();
          }
        });

        adapter.postMessage({
          source: "apollo-client-devtools",
          id,
          message: { type: name, params },
        });
      });
    },
  };
}

export function createRpcHandler<
  Messages extends RPC<string, RPCParams, SafeAny>,
>(adapter: MessageAdapter) {
  const listeners = new Map<
    string,
    (
      message: ApolloClientDevtoolsMessage<{ type: string; params: RPCParams }>
    ) => void
  >();
  let removeListener: (() => void) | null = null;

  function handleMessage(message: unknown) {
    if (
      isApolloClientDevtoolsMessage<{ type: string; params: RPCParams }>(
        message
      ) &&
      message.id != null
    ) {
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

  return function <TName extends Messages["__name"]>(
    name: TName,
    execute: (
      params: Extract<Messages, { __name: TName }>["__params"]
    ) => Extract<Messages, { __name: TName }>["__returnType"]
  ) {
    if (listeners.has(name)) {
      throw new Error("Only one rpc handler can be registered per type");
    }

    listeners.set(name, ({ id, message }) => {
      adapter.postMessage({
        source: "apollo-client-devtools",
        id,
        message: { result: execute(message.params) },
      });
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
