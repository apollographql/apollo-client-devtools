import { MessageAdapter } from "./messageAdapters";
import type { MessageFormat } from "./messages";

export interface RPCProvider {
  send: (message: unknown) => Promise<unknown>;
}

export interface RPCHandler {
  resolve: (
    name: string,
    callback: (message: unknown) => unknown
  ) => () => unknown;
}

export function createRPCProvider(adapter: MessageAdapter): RPCProvider {
  return {
    send: () => Promise.resolve(),
  };
}

export function createRPCHandler(adapter: MessageAdapter): RPCHandler {
  return {
    resolve: () => {
      return () => {};
    },
  };
}
