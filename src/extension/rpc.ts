import { SafeAny } from "../types";
import { MessageAdapter } from "./messageAdapters";

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

export interface RpcHandler<Messages extends RPC<string, RPCParams, SafeAny>> {
  on: <TName extends Messages["__name"]>(
    name: TName,
    callback: (
      params: Extract<Messages, { __name: TName }>["__params"]
    ) => Extract<Messages, { __name: TName }>["__returnType"]
  ) => () => void;
}

export function createRpcClient<
  Messages extends RPC<string, RPCParams, SafeAny>,
>(adapter: MessageAdapter): RpcClient<Messages> {
  return {
    request: () => Promise.resolve(),
  };
}

export function createRpcHandler<
  Messages extends RPC<string, RPCParams, SafeAny>,
>(adapter: MessageAdapter): RpcHandler<Messages> {
  return {
    on: () => {
      return () => {};
    },
  };
}
