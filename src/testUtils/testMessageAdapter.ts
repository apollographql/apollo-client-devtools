import { MessageAdapter } from "../extension/messageAdapters";
import type { ApolloClientDevtoolsMessage } from "../extension/messages";
import { createDevtoolsMessage, MessageType } from "../extension/messages";
import type { RPCRequestMessage } from "../extension/rpc";
import type { RPCRequest } from "../extension/rpc";
import type { SafeAny } from "../types";

export interface TestAdapter extends MessageAdapter {
  mocks: {
    messages: ApolloClientDevtoolsMessage[];
  };
  addListener: jest.MockedFunction<MessageAdapter["addListener"]>;
  postMessage: jest.MockedFunction<MessageAdapter["postMessage"]>;
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
  const mocks: TestAdapter["mocks"] = { messages: [] };

  async function handleRpcRequest(message: RPCRequestMessage) {
    const handler = rpcHandlers.get(message.name);

    if (!handler) {
      throw new Error(
        `An rpc handler is not configured to handle '${message.name}' which will result in an rpc request that does not resolve.`
      );
    }

    const result = await Promise.resolve(handler(...message.params));
    const response = createDevtoolsMessage({
      type: MessageType.RPCResponse,
      target: message.target,
      sourceId: message.id,
      result,
    });

    if (message.target?.type === "aggregate") {
      const aggregateResponse = createDevtoolsMessage({
        type: MessageType.AggregateResponse,
        target: message.target,
        results: [response],
      });

      return listeners.forEach((listener) => listener(aggregateResponse));
    }

    listeners.forEach((listener) => listener(response));
  }

  const adapter = new MessageAdapter({
    addListener: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    postMessage: (message) => {
      mocks.messages.push(message);

      if (message.type === MessageType.RPCRequest) {
        handleRpcRequest(message);
      }
    },
  });

  jest.spyOn(adapter, "addListener");
  jest.spyOn(adapter, "postMessage");

  return Object.assign(adapter, {
    mocks,
    handleRpcRequest: ((name, callback) => {
      rpcHandlers.set(name, callback as SafeAny);
    }) satisfies TestAdapter["handleRpcRequest"],
    mockClear: () => {
      mocks.messages = [];
      jest.mocked(adapter.addListener).mockClear();
      jest.mocked(adapter.postMessage).mockClear();
      rpcHandlers.clear();
    },
  }) as TestAdapter;
}
