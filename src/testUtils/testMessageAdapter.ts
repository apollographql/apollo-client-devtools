import type { MessageAdapter } from "../extension/messageAdapters";
import type { RPCResponseMessage } from "../extension/messages";

interface TestAdapter extends MessageAdapter<RPCResponseMessage> {
  mocks: { messages: unknown[] };
  simulateMessage: (message: unknown) => void;
  postMessage: jest.Mock<void, [message: unknown]>;
  proxyTo: (adapter: TestAdapter) => void;
  mockClear: () => void;
}

export function createTestAdapter(): TestAdapter {
  let proxy: TestAdapter | undefined;
  const listeners = new Set<(message: unknown) => void>();
  const messages: unknown[] = [];

  const adapter: TestAdapter = {
    mocks: { messages },
    simulateMessage: (message) => {
      listeners.forEach((fn) => fn(message));
    },
    addListener: jest.fn((fn) => {
      listeners.add(fn);

      return () => listeners.delete(fn);
    }),
    postMessage: jest.fn((message) => {
      messages.push(message);
      proxy?.simulateMessage(message);
    }),
    proxyTo: (adapter) => {
      proxy = adapter;
    },
    mockClear: () => {
      adapter.mocks.messages = [];
      listeners.clear();
      (adapter.addListener as jest.Mock).mockClear();
      adapter.postMessage.mockClear();
      proxy = undefined;
    },
  };

  return adapter;
}
