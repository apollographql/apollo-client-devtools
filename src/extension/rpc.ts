import { SafeAny } from "../types";
import { MessageAdapter } from "./messageAdapters";
import { isApolloClientDevtoolsMessage } from "./messages";

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
  handle: <TName extends Messages["__name"]>(
    name: TName,
    callback: (
      params: Extract<Messages, { __name: TName }>["__params"]
    ) => Extract<Messages, { __name: TName }>["__returnType"]
  ) => () => void;
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
    handle: (name, execute) => {
      return adapter.addListener((message) => {
        if (
          isApolloClientDevtoolsMessage(message) &&
          message.message.type === name
        ) {
          const result = execute(message.message.params as RPCParams);

          adapter.postMessage({
            source: "apollo-client-devtools",
            id: message.id,
            message: { result },
          });
        }
      });
    },
  };
}
