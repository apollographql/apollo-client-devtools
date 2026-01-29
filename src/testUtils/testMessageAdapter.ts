import type { MessageAdapter } from "../extension/messageAdapters";
import { MessageType } from "../extension/messages";
import type { RPCRequestMessage, RPCResponseMessage } from "../extension/rpc";
import { isRPCRequestMessage, type RPCRequest } from "../extension/rpc";
import type { SafeAny } from "../types";
import { createId } from "../utils/createId";

export interface TestAdapter extends MessageAdapter {
  mocks: { messages: unknown[] };
  postMessage: jest.Mock<void, [message: unknown]>;
  mockClear: () => void;
  handleRpcRequest: <TName extends keyof RPCRequest>(
    name: TName,
    callback: (
      ...args: Parameters<RPCRequest[TName]>
    ) => ReturnType<RPCRequest[TName]>
  ) => void;
}

export function createTestAdapter(): TestAdapter {
  const rpcHandlers = new Map<string, (...args: unknown[]) => unknown>();
  const listeners = new Set<(message: unknown) => void>();
  const messages: unknown[] = [];

  async function handleRpcRequest(message: RPCRequestMessage) {
    const handler = rpcHandlers.get(message.name);

    if (!handler) {
      throw new Error(
        `An rpc handler is not configured to handle '${message.name}' which will result in an rpc request that does not resolve.`
      );
    }

    const result = await Promise.resolve(handler(...message.params));
    const response: RPCResponseMessage = {
      source: "apollo-client-devtools",
      type: MessageType.RPCResponse,
      id: createId(),
      sourceId: message.id,
      result,
    };

    listeners.forEach((listener) => listener(response));
  }

  const adapter: TestAdapter = {
    mocks: { messages },
    addListener: jest.fn((fn) => {
      listeners.add(fn);

      return () => listeners.delete(fn);
    }),
    postMessage: jest.fn((message) => {
      messages.push(message);

      if (isRPCRequestMessage(message)) {
        handleRpcRequest(message);
      }
    }),
    handleRpcRequest: (name, callback) => {
      rpcHandlers.set(name, callback as SafeAny);
    },
    mockClear: () => {
      adapter.mocks.messages = [];
      listeners.clear();
      (adapter.addListener as jest.Mock).mockClear();
      adapter.postMessage.mockClear();
      rpcHandlers.clear();
    },
  };

  return adapter;
}
