import { panelMessageAdapter } from "./panelTransport";
import { createRpcClient, type RpcClient } from "../rpc";

let rpcClient: RpcClient | null = null;

export function getRpcClient() {
  return (rpcClient ||= createRpcClient(panelMessageAdapter));
}
