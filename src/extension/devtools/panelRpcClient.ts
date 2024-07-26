import { createWindowMessageAdapter } from "../messageAdapters";
import { createRpcClient, type RpcClient } from "../rpc";

let rpcClient: RpcClient | null = null;

export function getRpcClient() {
  return (rpcClient ||= createRpcClient(createWindowMessageAdapter(window)));
}
