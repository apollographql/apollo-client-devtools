import { createWindowMessageAdapter } from "../messageAdapters";
import type { PanelRPCMessage } from "../messages";
import { createRpcClient, type RpcClient } from "../rpc";

let rpcClient: RpcClient<PanelRPCMessage> | null = null;

export function getRpcClient(window: Window) {
  return (rpcClient ||= createRpcClient<PanelRPCMessage>(
    createWindowMessageAdapter(window)
  ));
}
