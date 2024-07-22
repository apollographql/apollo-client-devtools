import { createTestAdapter } from "../../../testUtils/testMessageAdapter";
import type { DevtoolsRPCMessage } from "../../messages";
import { createRpcClient } from "../../rpc";

const adapter = createTestAdapter();
const rpcClient = createRpcClient<DevtoolsRPCMessage>(adapter);

export type GetRpcClientMock = typeof getRpcClient;

export function getRpcClient() {
  return rpcClient;
}

getRpcClient.__adapter = adapter;
