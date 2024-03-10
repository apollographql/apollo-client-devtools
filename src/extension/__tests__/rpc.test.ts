import { MessageAdapter } from "../messageAdapters";
import { RPC, createRpcClient, createRpcHandler } from "../rpc";

interface TestAdapter extends MessageAdapter {
  mocks: { listeners: Set<(message: unknown) => void> };
  simulateMessage: (message: unknown) => void;
  connect: (adapter: TestAdapter) => void;
}

function createTestAdapter(): TestAdapter {
  let proxy: TestAdapter | undefined;
  const listeners = new Set<(message: unknown) => void>();

  return {
    mocks: { listeners },
    simulateMessage: (message: unknown) => {
      listeners.forEach((fn) => fn(message));
    },
    addListener: jest.fn((fn) => {
      listeners.add(fn);

      return () => listeners.delete(fn);
    }),
    postMessage: jest.fn((message) => {
      proxy?.simulateMessage(message);
    }),
    connect: (adapter: TestAdapter) => {
      proxy = adapter;
    },
  };
}

function createBridge(adapter1: TestAdapter, adapter2: TestAdapter) {
  adapter1.connect(adapter2);
  adapter2.connect(adapter1);
}

test("can send and receive rpc messages", async () => {
  type Message = RPC<"add", { x: number; y: number }, number>;
  // Since these are sent over separate instances in the real world, we want to
  // simulate that as best as we can with separate adapters
  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient<Message>(clientAdapter);
  const handle = createRpcHandler<Message>(handlerAdapter);

  handle("add", ({ x, y }) => x + y);

  const result = await client.request("add", { x: 1, y: 2 });

  expect(result).toBe(3);

  // Even though this is testing an implementation detail, we want to make sure
  // the message format matches our devtools messages
  expect(clientAdapter.postMessage).toHaveBeenCalledTimes(1);
  expect(clientAdapter.postMessage).toHaveBeenCalledWith({
    source: "apollo-client-devtools",
    id: 1,
    message: { type: "add", params: { x: 1, y: 2 } },
  });
  expect(handlerAdapter.postMessage).toHaveBeenCalledTimes(1);
  expect(handlerAdapter.postMessage).toHaveBeenCalledWith({
    source: "apollo-client-devtools",
    id: 1,
    message: { result: 3 },
  });
});

test("can handle multiple rpc messages", async () => {
  type Message =
    | RPC<"add", { x: number; y: number }, number>
    | RPC<"shout", { text: string }, string>;

  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient<Message>(clientAdapter);
  const handle = createRpcHandler<Message>(handlerAdapter);

  handle("add", ({ x, y }) => x + y);
  handle("shout", ({ text }) => text.toUpperCase());

  const result = await client.request("add", { x: 1, y: 2 });
  const uppercase = await client.request("shout", { text: "hello" });

  expect(result).toBe(3);
  expect(uppercase).toBe("HELLO");
});
