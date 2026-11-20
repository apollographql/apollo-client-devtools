import { panelMessageAdapter } from "./panelTransport";
import { createRpcClient, type RpcClient } from "../rpc";
import { createClientMessageAdapter } from "../messageAdapters";

const rpcClientsById = new Map<string, RpcClient>();
let rpcClient: RpcClient | null = null;

export function getRpcClient() {
  return (rpcClient ||= createRpcClient(panelMessageAdapter));
}

export function getRpcClientById(id: string) {
  let rpcClient = rpcClientsById.get(id);

  if (!rpcClient) {
    rpcClientsById.set(
      id,
      (rpcClient = createRpcClient(
        createClientMessageAdapter(panelMessageAdapter, id)
      ))
    );
  }

  return rpcClient;
}
