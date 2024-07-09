import type { MessageAdapter } from "../extension/messageAdapters";
import type { RPCMessage, RPCRequestMessage } from "../extension/messages";
import {
  isRPCRequestMessage,
  isRPCResponseMessage,
  MessageType,
} from "../extension/messages";
import { createId } from "../utils/createId";
// import type { DistributiveOmit } from "../types";

interface TestAdapter extends MessageAdapter<RPCMessage> {
  mocks: { messages: unknown[] };
  handleRpc: (
    name: string,
    callback: (...args: unknown[]) => unknown | Promise<unknown>
  ) => void;
  postMessage: jest.Mock<void, [message: unknown]>;
}

export function createTestAdapter(): TestAdapter {
  const listeners = new Set<(message: unknown) => void>();
  const rpcHandlers = new Map<
    string,
    (...args: unknown[]) => unknown | Promise<unknown>
  >();
  const messages: unknown[] = [];

  async function handleRpcRequest(message: RPCRequestMessage) {
    const handler = rpcHandlers.get(message.name);

    if (!handler) {
      return;
    }

    const result = await Promise.resolve(handler(...message.params));

    adapter.postMessage({
      source: "apollo-client-devtools",
      type: MessageType.RPCResponse,
      id: createId(),
      sourceId: message.id,
      result,
    });
  }

  function notifyListeners(message: unknown) {
    listeners.forEach((listener) => listener(message));
  }

  const adapter: TestAdapter = {
    mocks: { messages },
    handleRpc: (name, callback) => {
      rpcHandlers.set(name, callback);
    },
    addListener: jest.fn((fn) => {
      listeners.add(fn);

      return () => listeners.delete(fn);
    }),
    postMessage: jest.fn((message) => {
      messages.push(message);

      if (isRPCRequestMessage(message)) {
        handleRpcRequest(message);
      } else if (isRPCResponseMessage(message)) {
        notifyListeners(message);
      }
    }),
  };

  return adapter;
}
