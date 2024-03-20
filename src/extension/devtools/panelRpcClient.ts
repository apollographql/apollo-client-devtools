import { createWindowMessageAdapter } from "../messageAdapters";
import type { DevtoolsRPCMessage } from "../messages";
import { createRpcClient, type RpcClient } from "../rpc";

let rpcClient: RpcClient<DevtoolsRPCMessage> | null = null;

export function getRpcClient(window: Window) {
  return (rpcClient ||= createRpcClient<DevtoolsRPCMessage>(
    createWindowMessageAdapter(window)
  ));
}
