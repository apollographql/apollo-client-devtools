import { MessageAdapter } from "../messageAdapters";
import { ApolloClientDevtoolsRPCMessage, MessageType } from "../messages";
import { RPC, createRpcClient, createRpcHandler } from "../rpc";

interface TestAdapter extends MessageAdapter {
  mocks: { listeners: Set<(message: unknown) => void> };
  simulateMessage: (message: unknown) => void;
  simulateRPCMessage: (
    message: Omit<
      ApolloClientDevtoolsRPCMessage<Record<string, unknown>>,
      "type" | "source"
    >
  ) => void;
  connect: (adapter: TestAdapter) => void;
}

function createTestAdapter(): TestAdapter {
  let proxy: TestAdapter | undefined;
  const listeners = new Set<(message: unknown) => void>();

  return {
    mocks: { listeners },
    simulateMessage: (message) => {
      listeners.forEach((fn) => fn(message));
    },
    simulateRPCMessage: (message) => {
      listeners.forEach((fn) =>
        fn({
          ...message,
          type: MessageType.RPC,
          source: "apollo-client-devtools",
        })
      );
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
    type: MessageType.RPC,
    id: 1,
    message: { type: "add", params: { x: 1, y: 2 } },
  });
  expect(handlerAdapter.postMessage).toHaveBeenCalledTimes(1);
  expect(handlerAdapter.postMessage).toHaveBeenCalledWith({
    source: "apollo-client-devtools",
    type: MessageType.RPC,
    id: 1,
    message: { result: 3 },
  });
});

test("resolves async handlers", async () => {
  type Message = RPC<"add", { x: number; y: number }, number>;
  // Since these are sent over separate instances in the real world, we want to
  // simulate that as best as we can with separate adapters
  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient<Message>(clientAdapter);
  const handle = createRpcHandler<Message>(handlerAdapter);

  handle("add", ({ x, y }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(x + y);
      }, 10);
    });
  });

  const result = await client.request("add", { x: 1, y: 2 });

  expect(result).toBe(3);

  // Even though this is testing an implementation detail, we want to make sure
  // the message format matches our devtools messages
  expect(clientAdapter.postMessage).toHaveBeenCalledTimes(1);
  expect(clientAdapter.postMessage).toHaveBeenCalledWith({
    source: "apollo-client-devtools",
    type: MessageType.RPC,
    id: 1,
    message: { type: "add", params: { x: 1, y: 2 } },
  });
  expect(handlerAdapter.postMessage).toHaveBeenCalledTimes(1);
  expect(handlerAdapter.postMessage).toHaveBeenCalledWith({
    source: "apollo-client-devtools",
    type: MessageType.RPC,
    id: 1,
    message: { result: 3 },
  });
});

test("rejects when handler throws error", async () => {
  type Message = RPC<"add", { x: number; y: number }, number>;
  // Since these are sent over separate instances in the real world, we want to
  // simulate that as best as we can with separate adapters
  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient<Message>(clientAdapter);
  const handle = createRpcHandler<Message>(handlerAdapter);

  handle("add", () => {
    throw new Error("Could not add");
  });

  await expect(client.request("add", { x: 1, y: 2 })).rejects.toEqual(
    new Error("Could not add")
  );
});

test("rejects when async handler rejects", async () => {
  type Message = RPC<"add", { x: number; y: number }, number>;
  // Since these are sent over separate instances in the real world, we want to
  // simulate that as best as we can with separate adapters
  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient<Message>(clientAdapter);
  const handle = createRpcHandler<Message>(handlerAdapter);

  handle("add", () => Promise.reject(new Error("Could not add")));

  await expect(client.request("add", { x: 1, y: 2 })).rejects.toEqual(
    new Error("Could not add")
  );
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

test("only allows one handler per type", async () => {
  type Message = RPC<"add", { x: number; y: number }, number>;

  const handle = createRpcHandler<Message>(createTestAdapter());

  handle("add", ({ x, y }) => x + y);

  expect(() => {
    handle("add", ({ x, y }) => x - y);
  }).toThrow(new Error("Only one rpc handler can be registered per type"));
});

test("ignores messages that don't originate from devtools", () => {
  type Message = RPC<"add", { x: number; y: number }, number>;

  const adapter = createTestAdapter();
  const handle = createRpcHandler<Message>(adapter);

  const callback = jest.fn();
  handle("add", callback);

  adapter.simulateMessage({ type: "add", x: 1, y: 2 });

  expect(callback).not.toHaveBeenCalled();
});

// RPC messages always provide an `id`, but actor messages do not. In case an
// actor message type collides with an rpc message type, we want to ignore the
// actor message type.
test("ignores messages that aren't rpc messages", () => {
  type Message = RPC<"add", { x: number; y: number }, number>;

  const adapter = createTestAdapter();
  const handle = createRpcHandler<Message>(adapter);

  const callback = jest.fn();
  handle("add", callback);

  adapter.simulateMessage({
    source: "apollo-client-devtools",
    type: MessageType.Event,
    message: { type: "add", x: 1, y: 2 },
  });

  expect(callback).not.toHaveBeenCalled();
});

test("does not add listener to adapter until first subscribed handler", () => {
  type Message = RPC<"add", { x: number; y: number }, number>;

  const adapter = createTestAdapter();
  const handle = createRpcHandler<Message>(adapter);

  expect(adapter.addListener).not.toHaveBeenCalled();

  handle("add", ({ x, y }) => x + y);

  expect(adapter.addListener).toHaveBeenCalled();
});

test("adds a single listener regardless of active handlers", () => {
  type Message =
    | RPC<"add", { x: number; y: number }, number>
    | RPC<"subtract", { x: number; y: number }, number>
    | RPC<"shout", { text: string }, string>;

  const adapter = createTestAdapter();
  const handle = createRpcHandler<Message>(adapter);

  expect(adapter.addListener).not.toHaveBeenCalled();

  handle("add", ({ x, y }) => x + y);
  handle("subtract", ({ x, y }) => x - y);
  handle("shout", ({ text }) => text.toUpperCase());

  expect(adapter.addListener).toHaveBeenCalledTimes(1);
});

test("can unsubscribe from a handler by calling the returned function", () => {
  type Message = RPC<"add", { x: number; y: number }, number>;

  const adapter = createTestAdapter();
  const handle = createRpcHandler<Message>(adapter);

  const add = jest.fn();
  const unsubscribe = handle("add", add);

  adapter.simulateRPCMessage({
    id: 1,
    message: { type: "add", params: { x: 1, y: 2 } },
  });

  expect(add).toHaveBeenCalledTimes(1);

  add.mockClear();
  unsubscribe();

  adapter.simulateRPCMessage({
    id: 2,
    message: { type: "add", params: { x: 1, y: 2 } },
  });

  expect(add).not.toHaveBeenCalled();
});

test("removes listener on adapter when unsubscribing from last handler", () => {
  type Message =
    | RPC<"add", { x: number; y: number }, number>
    | RPC<"shout", { text: string }, string>;

  const adapter = createTestAdapter();
  const handle = createRpcHandler<Message>(adapter);

  const unsubscribeAdd = handle("add", ({ x, y }) => x + y);
  const unsubscribeShout = handle("shout", ({ text }) => text.toUpperCase());

  unsubscribeAdd();
  expect(adapter.mocks.listeners.size).toBe(1);

  unsubscribeShout();
  expect(adapter.mocks.listeners.size).toBe(0);
});

test("re-adds listener on adapter when subscribing after unsubscribing", () => {
  type Message = RPC<"add", { x: number; y: number }, number>;

  const adapter = createTestAdapter();
  const handle = createRpcHandler<Message>(adapter);

  const add = ({ x, y }: { x: number; y: number }) => x + y;
  const unsubscribe = handle("add", add);

  unsubscribe();
  expect(adapter.mocks.listeners.size).toBe(0);

  handle("add", add);
  expect(adapter.mocks.listeners.size).toBe(1);
});

test("times out if no message received within default timeout", async () => {
  jest.useFakeTimers();
  type Message = RPC<"add", { x: number; y: number }, number>;

  const adapter = createTestAdapter();
  const client = createRpcClient<Message>(adapter);

  const promise = client.request("add", { x: 1, y: 2 });

  jest.advanceTimersByTime(30_000);

  await expect(promise).rejects.toEqual(
    new Error("Timeout waiting for message")
  );

  jest.useRealTimers();
});

test("times out if no message received within configured timeout", async () => {
  jest.useFakeTimers();
  type Message = RPC<"add", { x: number; y: number }, number>;

  const adapter = createTestAdapter();
  const client = createRpcClient<Message>(adapter);

  const promise = client.request("add", { x: 1, y: 2 }, { timeoutMs: 1000 });

  jest.advanceTimersByTime(1_000);

  await expect(promise).rejects.toEqual(
    new Error("Timeout waiting for message")
  );

  jest.useRealTimers();
});
