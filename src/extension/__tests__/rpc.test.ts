import type { DistributiveOmit } from "../../types";
import { RPC_MESSAGE_TIMEOUT } from "../errorMessages";
import type { MessageAdapter } from "../messageAdapters";
import type { RPCMessage, RPCRequestMessage } from "../messages";
import { MessageType } from "../messages";
import { createRPCBridge, createRpcClient, createRpcHandler } from "../rpc";

interface TestAdapter extends MessageAdapter<RPCMessage> {
  mocks: { listeners: Set<(message: unknown) => void>; messages: unknown[] };
  simulateMessage: (message: unknown) => void;
  simulateRPCMessage: (message: DistributiveOmit<RPCMessage, "source">) => void;
  postMessage: jest.Mock<void, [message: unknown]>;
  connect: (adapter: TestAdapter) => void;
}

function createTestAdapter(): TestAdapter {
  let proxy: TestAdapter | undefined;
  const listeners = new Set<(message: unknown) => void>();
  const messages: unknown[] = [];

  return {
    mocks: { listeners, messages },
    simulateMessage: (message) => {
      listeners.forEach((fn) => fn(message));
    },
    simulateRPCMessage: (message) => {
      listeners.forEach((fn) =>
        fn({
          ...message,
          source: "apollo-client-devtools",
        })
      );
    },
    addListener: jest.fn((fn) => {
      listeners.add(fn);

      return () => listeners.delete(fn);
    }),
    postMessage: jest.fn((message) => {
      messages.push(message);
      proxy?.simulateMessage(message);
    }),
    // Connects two adapters so that a postMessage from one adapter calls
    // listeners on the proxy adapter. This isn't forwarding, but rather tries
    // to simulate the window.postMessage(), window.addEventListener('message')
    // behavior.
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
  type Message = {
    add(x: number, y: number): number;
  };
  // Since these are sent over separate instances in the real world, we want to
  // simulate that as best as we can with separate adapters
  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient<Message>(clientAdapter);
  const handle = createRpcHandler<Message>(handlerAdapter);

  handle("add", (x, y) => x + y);

  const result = await client.request("add", 1, 2);

  expect(result).toBe(3);
});

test("resolves async handlers", async () => {
  type Message = {
    add(x: number, y: number): number;
  };
  // Since these are sent over separate instances in the real world, we want to
  // simulate that as best as we can with separate adapters
  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient<Message>(clientAdapter);
  const handle = createRpcHandler<Message>(handlerAdapter);

  handle("add", (x, y) => {
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(x + y);
      }, 10);
    });
  });

  const result = await client.request("add", 1, 2);

  expect(result).toBe(3);
});

test("does not mistakenly handle messages from different rpc calls", async () => {
  type Message = {
    add(x: number, y: number): number;
  };
  const clientAdapter = createTestAdapter();
  const client = createRpcClient<Message>(clientAdapter);

  const promise = client.request("add", 1, 2);

  const { id } = clientAdapter.mocks.messages[0] as RPCRequestMessage;

  clientAdapter.simulateRPCMessage({
    id: "zef",
    type: MessageType.RPCResponse,
    sourceId: id + "zzz",
    result: 4,
  });

  clientAdapter.simulateRPCMessage({
    type: MessageType.RPCResponse,
    id: "abcdefg",
    sourceId: id,
    result: 3,
  });

  await expect(promise).resolves.toBe(3);
});

test("rejects when handler throws error", async () => {
  type Message = {
    add(x: number, y: number): number;
  };
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

  await expect(client.request("add", 1, 2)).rejects.toEqual(
    new Error("Could not add")
  );
});

test("rejects when async handler rejects", async () => {
  type Message = {
    add(x: number, y: number): number;
  };
  // Since these are sent over separate instances in the real world, we want to
  // simulate that as best as we can with separate adapters
  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient<Message>(clientAdapter);
  const handle = createRpcHandler<Message>(handlerAdapter);

  handle("add", () => Promise.reject(new Error("Could not add")));

  await expect(client.request("add", 1, 2)).rejects.toEqual(
    new Error("Could not add")
  );
});

test("can handle multiple rpc messages", async () => {
  type Message = {
    add(x: number, y: number): number;
    // while we're at it, let's have this one return a Promise in the definition
    // it should not matter for the implementation
    shout(text: string): Promise<string>;
  };

  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient<Message>(clientAdapter);
  const handle = createRpcHandler<Message>(handlerAdapter);

  handle("add", (x, y) => x + y);
  handle("shout", (text) => Promise.resolve(text.toUpperCase()));

  const result = await client.request("add", 1, 2);
  const uppercase = await client.request("shout", "hello");

  expect(result).toBe(3);
  expect(uppercase).toBe("HELLO");
});

test("only allows one handler per type", async () => {
  type Message = {
    add({ x, y }: { x: number; y: number }): number;
  };

  const handle = createRpcHandler<Message>(createTestAdapter());

  handle("add", ({ x, y }) => x + y);

  expect(() => {
    handle("add", ({ x, y }) => x - y);
  }).toThrow(new Error("Only one rpc handler can be registered per type"));
});

test("can handle any parameter format", async () => {
  type Message = {
    add(x: number, y: number): number;
    shout(text: string): string;
    join(strings: string[], delimeter: string): string;
    getFullName(user: { firstName: string; lastName: string }): string;
    getStoredValues(): number[];
  };

  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient<Message>(clientAdapter);
  const handle = createRpcHandler<Message>(handlerAdapter);

  handle("add", (x, y) => x + y);
  handle("shout", (text) => text.toUpperCase());
  handle("join", (strings, delimeter) => strings.join(delimeter));
  handle("getFullName", (user) => user.firstName + " " + user.lastName);
  handle("getStoredValues", () => [1, 2, 3]);

  const result = await client.request("add", 1, 2);
  const uppercase = await client.request("shout", "hello");
  const joined = await client.request("join", ["a", "b", "c"], ",");
  const fullName = await client.request("getFullName", {
    firstName: "John",
    lastName: "Doe",
  });
  const storedValues = await client.request("getStoredValues");

  expect(result).toBe(3);
  expect(uppercase).toBe("HELLO");
  expect(joined).toEqual("a,b,c");
  expect(fullName).toEqual("John Doe");
  expect(storedValues).toEqual([1, 2, 3]);
});

test("ignores messages that don't originate from devtools", () => {
  type Message = {
    add(x: number, y: number): number;
  };

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
  type Message = {
    add({ x, y }: { x: number; y: number }): number;
  };

  const adapter = createTestAdapter();
  const handle = createRpcHandler<Message>(adapter);

  const callback = jest.fn();
  handle("add", callback);

  adapter.simulateMessage({
    source: "apollo-client-devtools",
    type: MessageType.Event,
    payload: { type: "add", x: 1, y: 2 },
  });

  expect(callback).not.toHaveBeenCalled();
});

test("does not add listener to adapter until first subscribed handler", () => {
  type Message = {
    add(x: number, y: number): number;
  };

  const adapter = createTestAdapter();
  const handle = createRpcHandler<Message>(adapter);

  expect(adapter.addListener).not.toHaveBeenCalled();

  handle("add", (x, y) => x + y);

  expect(adapter.addListener).toHaveBeenCalled();
});

test("adds a single listener regardless of active handlers", () => {
  type Message = {
    add(x: number, y: number): number;
    subtract(x: number, y: number): number;
    shout(text: string): string;
  };

  const adapter = createTestAdapter();
  const handle = createRpcHandler<Message>(adapter);

  expect(adapter.addListener).not.toHaveBeenCalled();

  handle("add", (x, y) => x + y);
  handle("subtract", (x, y) => x - y);
  handle("shout", (text) => text.toUpperCase());

  expect(adapter.addListener).toHaveBeenCalledTimes(1);
});

test("can unsubscribe from a handler by calling the returned function", () => {
  type Message = {
    add(x: number, y: number): number;
  };

  const adapter = createTestAdapter();
  const handle = createRpcHandler<Message>(adapter);

  const add = jest.fn();
  const unsubscribe = handle("add", add);

  adapter.simulateRPCMessage({
    id: "abc",
    type: MessageType.RPCRequest,
    name: "add",
    params: [{ x: 1, y: 2 }],
  });

  expect(add).toHaveBeenCalledTimes(1);

  add.mockClear();
  unsubscribe();

  adapter.simulateRPCMessage({
    id: "xyz",
    type: MessageType.RPCRequest,
    name: "add",
    params: [{ x: 1, y: 2 }],
  });

  expect(add).not.toHaveBeenCalled();
});

test("removes listener on adapter when unsubscribing from last handler", () => {
  type Message = {
    add(x: number, y: number): number;
    shout({ text }: { text: string }): string;
  };

  const adapter = createTestAdapter();
  const handle = createRpcHandler<Message>(adapter);

  const unsubscribeAdd = handle("add", (x, y) => x + y);
  const unsubscribeShout = handle("shout", ({ text }) => text.toUpperCase());

  unsubscribeAdd();
  expect(adapter.mocks.listeners.size).toBe(1);

  unsubscribeShout();
  expect(adapter.mocks.listeners.size).toBe(0);
});

test("re-adds listener on adapter when subscribing after unsubscribing", () => {
  type Message = {
    add(x: number, y: number): number;
  };

  const adapter = createTestAdapter();
  const handle = createRpcHandler<Message>(adapter);

  const add = (x: number, y: number) => x + y;
  const unsubscribe = handle("add", add);

  unsubscribe();
  expect(adapter.mocks.listeners.size).toBe(0);

  handle("add", add);
  expect(adapter.mocks.listeners.size).toBe(1);
});

test("times out if no message received within default timeout", async () => {
  jest.useFakeTimers();
  type Message = {
    add(x: number, y: number): number;
  };

  const adapter = createTestAdapter();
  const client = createRpcClient<Message>(adapter);

  const promise = client.request("add", 1, 2);

  jest.advanceTimersByTime(30_000);

  await expect(promise).rejects.toEqual(new Error(RPC_MESSAGE_TIMEOUT));

  jest.useRealTimers();
});

test("times out if no message received within configured timeout", async () => {
  jest.useFakeTimers();
  type Message = {
    add(x: number, y: number): number;
  };

  const adapter = createTestAdapter();
  const client = createRpcClient<Message>(adapter);

  const promise = client.withTimeout(1000).request("add", 1, 2);

  jest.advanceTimersByTime(1000);

  await expect(promise).rejects.toEqual(new Error(RPC_MESSAGE_TIMEOUT));

  jest.useRealTimers();
});

test("resets timeout to default timeout after sending request", async () => {
  jest.useFakeTimers();
  type Message = {
    add(x: number, y: number): number;
  };

  const adapter = createTestAdapter();
  const client = createRpcClient<Message>(adapter);

  const t1 = client.withTimeout(1000);
  const t2 = client.withTimeout(2000);

  expect(client.timeout).toBe(30_000);
  expect(t1.timeout).toBe(1000);
  expect(t2.timeout).toBe(2000);

  const finished = new Set<Promise<number>>();

  const promise1 = t1.request("add", 1, 2);
  promise1
    .finally(() => finished.add(promise1))
    .catch(() => {
      /* prevent unhandled rejection warning */
    });

  const promise2 = t2.request("add", 1, 2);
  promise2
    .finally(() => finished.add(promise2))
    .catch(() => {
      /* prevent unhandled rejection warning */
    });

  jest.advanceTimersByTime(1000);

  // wait for a tick, just to be sure the `finally` block has time to run
  await Promise.resolve();
  expect(finished).toContain(promise1);
  expect(finished).not.toContain(promise2);

  await expect(promise1).rejects.toEqual(new Error(RPC_MESSAGE_TIMEOUT));

  jest.advanceTimersByTime(1000);
  // wait for a tick, just to be sure the `finally` block has time to run
  await Promise.resolve();
  expect(finished).toContain(promise2);
  await expect(promise2).rejects.toEqual(new Error(RPC_MESSAGE_TIMEOUT));

  const promise3 = client.request("add", 1, 2);
  promise3
    .finally(() => finished.add(promise3))
    .catch(() => {
      /* prevent unhandled rejection warning */
    });

  jest.advanceTimersByTime(1000);

  // wait for a tick, just to be sure the `finally` block has time to run
  await Promise.resolve();
  expect(finished).not.toContain(promise3);

  jest.advanceTimersByTime(29_000);

  // wait for a tick, just to be sure the `finally` block has time to run
  await Promise.resolve();
  expect(finished).toContain(promise3);
  await expect(promise3).rejects.toEqual(new Error(RPC_MESSAGE_TIMEOUT));

  jest.useRealTimers();
});

test("forwards rpc messages from one adapter to another with bridge", () => {
  const adapter1 = createTestAdapter();
  const adapter2 = createTestAdapter();

  createRPCBridge(adapter1, adapter2);

  adapter1.simulateRPCMessage({
    id: "abc",
    type: MessageType.RPCRequest,
    name: "add",
    params: [{ x: 1, y: 2 }],
  });

  expect(adapter2.postMessage).toHaveBeenCalledTimes(1);
  expect(adapter2.postMessage).toHaveBeenCalledWith({
    source: "apollo-client-devtools",
    type: MessageType.RPCRequest,
    id: "abc",
    name: "add",
    params: [{ x: 1, y: 2 }],
  });

  adapter2.simulateRPCMessage({
    id: "xyz",
    type: MessageType.RPCRequest,
    name: "add",
    params: [{ x: 1, y: 2 }],
  });

  expect(adapter1.postMessage).toHaveBeenCalledTimes(1);
  expect(adapter1.postMessage).toHaveBeenCalledWith({
    source: "apollo-client-devtools",
    type: MessageType.RPCRequest,
    id: "xyz",
    name: "add",
    params: [{ x: 1, y: 2 }],
  });
});

test("unsubscribes connection on bridge when calling returned function", () => {
  const adapter1 = createTestAdapter();
  const adapter2 = createTestAdapter();

  const unsubscribe = createRPCBridge(adapter1, adapter2);

  adapter1.simulateRPCMessage({
    id: "abc",
    type: MessageType.RPCRequest,
    name: "add",
    params: [{ x: 1, y: 2 }],
  });
  expect(adapter2.postMessage).toHaveBeenCalled();

  adapter2.simulateRPCMessage({
    id: "xyz",
    type: MessageType.RPCRequest,
    name: "add",
    params: [{ x: 1, y: 2 }],
  });
  expect(adapter1.postMessage).toHaveBeenCalled();

  adapter1.postMessage.mockClear();
  adapter2.postMessage.mockClear();
  unsubscribe();

  adapter1.simulateRPCMessage({
    id: "def",
    type: MessageType.RPCRequest,
    name: "add",
    params: [{ x: 1, y: 2 }],
  });
  expect(adapter2.postMessage).not.toHaveBeenCalled();

  adapter2.simulateRPCMessage({
    id: "uvw",
    type: MessageType.RPCRequest,
    name: "add",
    params: [{ x: 1, y: 2 }],
  });
  expect(adapter1.postMessage).not.toHaveBeenCalled();
});

test.each([MessageType.Event])(
  "does not forward %s messages",
  (messageType) => {
    const adapter1 = createTestAdapter();
    const adapter2 = createTestAdapter();

    createRPCBridge(adapter1, adapter2);

    adapter1.simulateMessage({
      id: 1,
      type: messageType,
      payload: { type: "add", params: { x: 1, y: 2 } },
    });

    expect(adapter2.postMessage).not.toHaveBeenCalled();
  }
);
