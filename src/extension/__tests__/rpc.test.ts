import { gql } from "@apollo/client";
import type { ApolloClientInfo, DistributiveOmit } from "../../types";
import { createId } from "../../utils/createId";
import { RPC_MESSAGE_TIMEOUT } from "../errorMessages";
import { serializeError } from "../errorSerialization";
import type { MessageAdapter } from "../messageAdapters";
import { createMessageBridge } from "../messageAdapters";
import type { PostMessageError } from "../messages";
import { MessageType } from "../messages";
import type {
  RPCRequestMessage,
  RPCResponseMessage,
  RPCStreamStartMessage,
} from "../rpc";
import { createRpcClient, createRpcHandler } from "../rpc";
import type { CacheWrite } from "../tab/shared/types";

type RPCMessage = RPCRequestMessage | RPCResponseMessage;

type GetStreamValueType<Stream> =
  Stream extends ReadableStream<infer TValue> ? TValue : never;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

interface TestAdapter extends MessageAdapter {
  mocks: { listeners: Set<(message: unknown) => void>; messages: unknown[] };
  simulateMessage: (message: unknown) => void;
  simulateRPCMessage: (message: DistributiveOmit<RPCMessage, "source">) => void;
  simulateRPCStreamChunk: <TValue = unknown>(
    streamId: string,
    value: TValue
  ) => void;
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
    simulateRPCStreamChunk: (streamId, value) => {
      listeners.forEach((fn) =>
        fn({
          source: "apollo-client-devtools",
          type: MessageType.RPCStreamChunk,
          id: createId(),
          sourceId: streamId,
          value,
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

function defaultGetClient(id: string) {
  return {
    id,
    name: "Test",
    version: "3.11.0",
    queryCount: 0,
    mutationCount: 0,
  } satisfies ApolloClientInfo;
}

test("can send and receive rpc messages", async () => {
  // Since these are sent over separate instances in the real world, we want to
  // simulate that as best as we can with separate adapters
  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient(clientAdapter);
  const handle = createRpcHandler(handlerAdapter);

  handle("getClient", defaultGetClient);

  const result = await client.request("getClient", "1");

  expect(result).toEqual(defaultGetClient("1"));
});

test("resolves async handlers", async () => {
  // Since these are sent over separate instances in the real world, we want to
  // simulate that as best as we can with separate adapters
  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient(clientAdapter);
  const handle = createRpcHandler(handlerAdapter);

  handle("getClient", (id) => {
    return new Promise<ApolloClientInfo>((resolve) => {
      setTimeout(() => {
        resolve(defaultGetClient(id));
      }, 10);
    });
  });

  const result = await client.request("getClient", "1");

  expect(result).toEqual(defaultGetClient("1"));
});

test("does not mistakenly handle messages from different rpc calls", async () => {
  const clientAdapter = createTestAdapter();
  const client = createRpcClient(clientAdapter);

  const promise = client.request("getClient", "1");

  const { id } = clientAdapter.mocks.messages[0] as RPCRequestMessage;

  clientAdapter.simulateRPCMessage({
    id: "zef",
    type: MessageType.RPCResponse,
    sourceId: id + "zzz",
    result: {
      id: "2",
      name: "Nope",
      version: "3.7.0",
      queryCount: 10,
      mutationCount: 20,
    },
  });

  clientAdapter.simulateRPCMessage({
    type: MessageType.RPCResponse,
    id: "abcdefg",
    sourceId: id,
    result: defaultGetClient("1"),
  });

  await expect(promise).resolves.toEqual(defaultGetClient("1"));
});

test("rejects when handler throws error", async () => {
  // Since these are sent over separate instances in the real world, we want to
  // simulate that as best as we can with separate adapters
  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient(clientAdapter);
  const handle = createRpcHandler(handlerAdapter);

  handle("getClient", () => {
    throw new Error("Could not get client");
  });

  await expect(client.request("getClient", "1")).rejects.toEqual(
    new Error("Could not get client")
  );
});

test("rejects when async handler rejects", async () => {
  // Since these are sent over separate instances in the real world, we want to
  // simulate that as best as we can with separate adapters
  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient(clientAdapter);
  const handle = createRpcHandler(handlerAdapter);

  handle("getClient", () => Promise.reject(new Error("Could not get client")));

  await expect(client.request("getClient", "1")).rejects.toEqual(
    new Error("Could not get client")
  );
});

test("maintains error name", async () => {
  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient(clientAdapter);
  const handle = createRpcHandler(handlerAdapter);

  handle("getClient", () => Promise.reject(new SyntaxError()));

  try {
    await client.request("getClient", "1");
    throw new Error("Should not reach");
  } catch (e) {
    expect(e).toBeInstanceOf(SyntaxError);
    expect((e as Error).name).toBe("SyntaxError");
  }
});

test("can handle multiple rpc messages", async () => {
  const handlerAdapter = createTestAdapter();
  const clientAdapter = createTestAdapter();
  createBridge(clientAdapter, handlerAdapter);

  const client = createRpcClient(clientAdapter);
  const handle = createRpcHandler(handlerAdapter);

  handle("getClient", defaultGetClient);
  handle("getV3Queries", () => Promise.resolve([]));

  const result = await client.request("getClient", "1");
  const queries = await client.request("getV3Queries", "1");

  expect(result).toEqual(defaultGetClient("1"));
  expect(queries).toEqual([]);
});

test("only allows one handler per type", async () => {
  const handle = createRpcHandler(createTestAdapter());

  handle("getClient", defaultGetClient);

  expect(() => {
    handle("getClient", defaultGetClient);
  }).toThrow(new Error("Only one rpc handler can be registered per type"));
});

// Would love to contineu to test this, but our current messages don't allow for this.
test.skip("can handle any parameter format", async () => {
  // type Message = {
  //   add(x: number, y: number): number;
  //   shout(text: string): string;
  //   join(strings: string[], delimeter: string): string;
  //   getFullName(user: { firstName: string; lastName: string }): string;
  //   getStoredValues(): number[];
  // };
  //
  // const handlerAdapter = createTestAdapter();
  // const clientAdapter = createTestAdapter();
  // createBridge(clientAdapter, handlerAdapter);
  //
  // const client = createRpcClient<Message>(clientAdapter);
  // const handle = createRpcHandler<Message>(handlerAdapter);
  //
  // handle("add", (x, y) => x + y);
  // handle("shout", (text) => text.toUpperCase());
  // handle("join", (strings, delimeter) => strings.join(delimeter));
  // handle("getFullName", (user) => user.firstName + " " + user.lastName);
  // handle("getStoredValues", () => [1, 2, 3]);
  //
  // const result = await client.request("add", 1, 2);
  // const uppercase = await client.request("shout", "hello");
  // const joined = await client.request("join", ["a", "b", "c"], ",");
  // const fullName = await client.request("getFullName", {
  //   firstName: "John",
  //   lastName: "Doe",
  // });
  // const storedValues = await client.request("getStoredValues");
  //
  // expect(result).toBe(3);
  // expect(uppercase).toBe("HELLO");
  // expect(joined).toEqual("a,b,c");
  // expect(fullName).toEqual("John Doe");
  // expect(storedValues).toEqual([1, 2, 3]);
});

test("ignores messages that don't originate from devtools", () => {
  const adapter = createTestAdapter();
  const handle = createRpcHandler(adapter);

  const callback = jest.fn();
  handle("getClient", callback);

  adapter.simulateMessage({ type: "getClient", clientId: "1" });

  expect(callback).not.toHaveBeenCalled();
});

// RPC messages always provide an `id`, but actor messages do not. In case an
// actor message type collides with an rpc message type, we want to ignore the
// actor message type.
test("ignores messages that aren't rpc messages", () => {
  const adapter = createTestAdapter();
  const handle = createRpcHandler(adapter);

  const getClient = jest.fn();
  handle("getClient", getClient);

  adapter.simulateMessage({
    source: "apollo-client-devtools",
    type: MessageType.Actor,
    payload: { type: "getClient", clientId: "1" },
  });

  expect(getClient).not.toHaveBeenCalled();
});

test("does not add listener to adapter until first subscribed handler", () => {
  const adapter = createTestAdapter();
  const handle = createRpcHandler(adapter);

  expect(adapter.addListener).not.toHaveBeenCalled();

  handle("getClient", defaultGetClient);

  expect(adapter.addListener).toHaveBeenCalled();
});

test("adds a single listener regardless of active handlers", () => {
  const adapter = createTestAdapter();
  const handle = createRpcHandler(adapter);

  expect(adapter.addListener).not.toHaveBeenCalled();

  handle("getClient", defaultGetClient);
  handle("getV3Queries", () => []);
  handle("getV3Mutations", () => []);

  expect(adapter.addListener).toHaveBeenCalledTimes(1);
});

test("can unsubscribe from a handler by calling the returned function", () => {
  const adapter = createTestAdapter();
  const handle = createRpcHandler(adapter);

  const getClient = jest.fn();
  const unsubscribe = handle("getClient", getClient);

  adapter.simulateRPCMessage({
    id: "abc",
    type: MessageType.RPCRequest,
    name: "getClient",
    params: ["1"],
  });

  expect(getClient).toHaveBeenCalledTimes(1);

  getClient.mockClear();
  unsubscribe();

  adapter.simulateRPCMessage({
    id: "xyz",
    type: MessageType.RPCRequest,
    name: "getClient",
    params: ["2"],
  });

  expect(getClient).not.toHaveBeenCalled();
});

test("removes listener on adapter when unsubscribing from last handler", () => {
  const adapter = createTestAdapter();
  const handle = createRpcHandler(adapter);

  const unsubscribeGetClient = handle("getClient", defaultGetClient);
  const unsubscribeGetQueries = handle("getV3Queries", () => []);

  unsubscribeGetClient();
  expect(adapter.mocks.listeners.size).toBe(1);

  unsubscribeGetQueries();
  expect(adapter.mocks.listeners.size).toBe(0);
});

test("re-adds listener on adapter when subscribing after unsubscribing", () => {
  const adapter = createTestAdapter();
  const handle = createRpcHandler(adapter);

  const unsubscribe = handle("getClient", defaultGetClient);

  unsubscribe();
  expect(adapter.mocks.listeners.size).toBe(0);

  handle("getClient", defaultGetClient);
  expect(adapter.mocks.listeners.size).toBe(1);
});

test("times out if no message received within default timeout", async () => {
  jest.useFakeTimers();

  const adapter = createTestAdapter();
  const client = createRpcClient(adapter);

  const promise = client.request("getClient", "1");

  jest.advanceTimersByTime(30_000);

  await expect(promise).rejects.toEqual(new Error(RPC_MESSAGE_TIMEOUT));

  jest.useRealTimers();
});

test("times out if no message received within configured timeout", async () => {
  jest.useFakeTimers();

  const adapter = createTestAdapter();
  const client = createRpcClient(adapter);

  const promise = client.withTimeout(1000).request("getClient", "1");

  jest.advanceTimersByTime(1000);

  await expect(promise).rejects.toEqual(new Error(RPC_MESSAGE_TIMEOUT));

  jest.useRealTimers();
});

test("resets timeout to default timeout after sending request", async () => {
  jest.useFakeTimers();

  const adapter = createTestAdapter();
  const client = createRpcClient(adapter);

  const t1 = client.withTimeout(1000);
  const t2 = client.withTimeout(2000);

  expect(client.timeout).toBe(30_000);
  expect(t1.timeout).toBe(1000);
  expect(t2.timeout).toBe(2000);

  const finished = new Set<Promise<ApolloClientInfo | null>>();

  const promise1 = t1.request("getClient", "1");
  promise1
    .finally(() => finished.add(promise1))
    .catch(() => {
      /* prevent unhandled rejection warning */
    });

  const promise2 = t2.request("getClient", "2");
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

  const promise3 = client.request("getClient", "1");
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

test("rejects with abort error when provided signal aborts", async () => {
  const adapter = createTestAdapter();
  const client = createRpcClient(adapter);
  const controller = new AbortController();

  const promise = client
    .withSignal(controller.signal)
    .request("getClient", "1");

  await wait(10);
  controller.abort();

  await expect(promise).rejects.toEqual(
    new DOMException("The operation was aborted.", "AbortError")
  );
});

test("rejects when provided signal is already aborted", async () => {
  const adapter = createTestAdapter();
  const client = createRpcClient(adapter);
  const controller = new AbortController();
  controller.abort();

  const promise = client
    .withSignal(controller.signal)
    .request("getClient", "1");

  await expect(promise).rejects.toEqual(
    new DOMException("The operation was aborted.", "AbortError")
  );
});

test("forwards abort reason if provided", async () => {
  const adapter = createTestAdapter();
  const client = createRpcClient(adapter);
  const controller = new AbortController();

  const promise = client
    .withSignal(controller.signal)
    .request("getClient", "1");

  await wait(10);
  controller.abort("Manually aborted");

  await expect(promise).rejects.toEqual(
    new DOMException("Manually aborted", "AbortError")
  );
});

test("forwards rpc messages from one adapter to another with bridge", () => {
  const adapter1 = createTestAdapter();
  const adapter2 = createTestAdapter();

  createMessageBridge(adapter1, adapter2);

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

  const unsubscribe = createMessageBridge(adapter1, adapter2);

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

test("rejects with post message errors", async () => {
  const clientAdapter = createTestAdapter();
  const client = createRpcClient(clientAdapter);

  const promise = client.request("getClient", "1");

  const { id } = clientAdapter.mocks.messages[0] as RPCRequestMessage;

  clientAdapter.simulateMessage({
    id: "zef",
    type: MessageType.PostMessageError,
    sourceId: id,
    error: serializeError(new Error("Could not send")),
    source: "apollo-client-devtools",
  } satisfies PostMessageError);

  await expect(promise).rejects.toThrow(new Error("Could not send"));
});

test("ignores post message errors for a different rpc request", async () => {
  const clientAdapter = createTestAdapter();
  const client = createRpcClient(clientAdapter);

  const promise = client.request("getClient", "1");

  const { id } = clientAdapter.mocks.messages[0] as RPCRequestMessage;

  clientAdapter.simulateMessage({
    id: "zef",
    type: MessageType.PostMessageError,
    sourceId: id + "zzz",
    error: serializeError(new Error("Could not send")),
    source: "apollo-client-devtools",
  } satisfies PostMessageError);

  clientAdapter.simulateRPCMessage({
    type: MessageType.RPCResponse,
    id: "abcdefg",
    sourceId: id,
    result: defaultGetClient("1"),
  });

  await expect(promise).resolves.toEqual(defaultGetClient("1"));
});

test("can stream messages from adapter", async () => {
  const adapter = createTestAdapter();
  const client = createRpcClient(adapter);

  const stream = client.stream("cacheWrite", "1");
  const reader = stream.getReader();
  const { id } = adapter.mocks.messages[0] as RPCStreamStartMessage;

  adapter.simulateRPCStreamChunk<GetStreamValueType<typeof stream>>(id, {
    dataId: undefined,
    data: { foo: true },
    document: gql`
      query {
        foo
      }
    `,
    variables: undefined,
    overwrite: undefined,
    broadcast: undefined,
  });
  adapter.simulateRPCStreamChunk<GetStreamValueType<typeof stream>>(id, {
    dataId: undefined,
    data: { bar: false },
    document: gql`
      query {
        bar
      }
    `,
    variables: undefined,
    overwrite: undefined,
    broadcast: undefined,
  });

  await expect(reader.read()).resolves.toEqual({
    value: {
      dataId: undefined,
      data: { foo: true },
      documentString: "query { foo }",
      variables: undefined,
      overwrite: undefined,
      broadcast: undefined,
    },
    done: false,
  });
  await expect(reader.read()).resolves.toEqual({
    value: {
      dataId: undefined,
      data: { bar: false },
      documentString: "query { bar }",
      variables: undefined,
      overwrite: undefined,
      broadcast: undefined,
    },
    done: false,
  });
});

test("closes stream when abort controller aborts", async () => {
  const adapter = createTestAdapter();
  const client = createRpcClient(adapter);
  const controller = new AbortController();

  const stream = client.withSignal(controller.signal).stream("cacheWrite", "1");
  const reader = stream.getReader();
  const { id } = adapter.mocks.messages[0] as RPCStreamStartMessage;

  adapter.simulateRPCStreamChunk<CacheWrite>(id, {
    dataId: undefined,
    data: { foo: true },
    document: gql`
      query {
        foo
      }
    `,
    variables: undefined,
    overwrite: undefined,
    broadcast: undefined,
  });

  await expect(reader.read()).resolves.toEqual({
    value: {
      dataId: undefined,
      data: { foo: true },
      documentString: "query { foo }",
      variables: undefined,
      overwrite: undefined,
      broadcast: undefined,
    },
    done: false,
  });

  controller.abort();

  await expect(reader.read()).resolves.toEqual({
    value: undefined,
    done: true,
  });
});

test("does not mistakenly handle messages from different rpc streams", async () => {
  const adapter = createTestAdapter();
  const client = createRpcClient(adapter);

  const stream = client.stream("cacheWrite", "1");
  const reader = stream.getReader();

  adapter.simulateRPCStreamChunk<GetStreamValueType<typeof stream>>("xyz", {
    dataId: undefined,
    data: { foo: true },
    document: gql`
      query {
        foo
      }
    `,
    variables: undefined,
    overwrite: undefined,
    broadcast: undefined,
  });

  const promise = Promise.race([
    reader.read(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 10)
    ),
  ]);

  await expect(promise).rejects.toThrow(new Error("Timeout"));
});
