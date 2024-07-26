import { createTestAdapter } from "../../../testUtils/testMessageAdapter";
import { createRpcClient } from "../../rpc";

const adapter = createTestAdapter();
const rpcClient = createRpcClient(adapter);

export type GetRpcClientMock = typeof getRpcClient;

export function getRpcClient() {
  return rpcClient;
}

getRpcClient.__adapter = adapter;
