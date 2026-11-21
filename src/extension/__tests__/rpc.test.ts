import type { TestSource } from "@/testUtils/createTestSource";
import { createTestSource } from "@/testUtils/createTestSource";
import type { ApolloClientInfo } from "../../types";
import { RPC_MESSAGE_TIMEOUT } from "../errorMessages";
import { serializeError } from "../errorSerialization";
import { createMessageBridge, MessageAdapter } from "../messageAdapters";
import { MessageType } from "../messages";
import type { RPCRequestMessage, RPCStreamStartMessage } from "../rpc";
import {
  createRpcClient,
  createRpcHandler,
  createRpcStreamHandler,
} from "../rpc";
import { createId } from "@/utils/createId";

type TestStreamValue = { id: string; value: any };

declare module "../rpc" {
  export interface RPCStream {
    testStream(id: string): TestStreamValue;
    otherTestStream(id: string): TestStreamValue;
  }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function createBridge(source1: TestSource, source2: TestSource) {
  source1.proxy(source2);
  source2.proxy(source1);
}

function defaultGetClient(id = "1") {
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
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handle = createRpcHandler(new MessageAdapter(handlerSource));

  handle("getClient", defaultGetClient);

  const result = await client.request("getClient");

  expect(result).toEqual(defaultGetClient("1"));
});

test("resolves async handlers", async () => {
  // Since these are sent over separate instances in the real world, we want to
  // simulate that as best as we can with separate adapters
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handle = createRpcHandler(new MessageAdapter(handlerSource));

  handle("getClient", () => {
    return new Promise<ApolloClientInfo>((resolve) => {
      setTimeout(() => {
        resolve(defaultGetClient());
      }, 10);
    });
  });

  const result = await client.request("getClient");

  expect(result).toEqual(defaultGetClient("1"));
});

test("does not mistakenly handle messages from different rpc calls", async () => {
  const clientSource = createTestSource();
  const client = createRpcClient(new MessageAdapter(clientSource));

  const promise = client.request("getClient");

  const { id } = clientSource.mocks.messages[0];

  clientSource.simulateRPCResponse({
    sourceId: id + "zzz",
    result: {
      id: "2",
      name: "Nope",
      version: "3.7.0",
      queryCount: 10,
      mutationCount: 20,
    },
  });

  clientSource.simulateRPCResponse({
    sourceId: id,
    result: defaultGetClient("1"),
  });

  await expect(promise).resolves.toEqual(defaultGetClient("1"));
});

test("rejects when handler throws error", async () => {
  // Since these are sent over separate instances in the real world, we want to
  // simulate that as best as we can with separate adapters
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handle = createRpcHandler(new MessageAdapter(handlerSource));

  handle("getClient", () => {
    throw new Error("Could not get client");
  });

  await expect(client.request("getClient")).rejects.toEqual(
    new Error("Could not get client")
  );
});

test("rejects when async handler rejects", async () => {
  // Since these are sent over separate instances in the real world, we want to
  // simulate that as best as we can with separate adapters
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handle = createRpcHandler(new MessageAdapter(handlerSource));

  handle("getClient", () => Promise.reject(new Error("Could not get client")));

  await expect(client.request("getClient")).rejects.toEqual(
    new Error("Could not get client")
  );
});

test("maintains error name", async () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handle = createRpcHandler(new MessageAdapter(handlerSource));

  handle("getClient", () => Promise.reject(new SyntaxError()));

  try {
    await client.request("getClient");
    throw new Error("Should not reach");
  } catch (e) {
    expect(e).toBeInstanceOf(SyntaxError);
    expect((e as Error).name).toBe("SyntaxError");
  }
});

test("can handle multiple rpc messages", async () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handle = createRpcHandler(new MessageAdapter(handlerSource));

  handle("getClient", defaultGetClient);
  handle("getV3Queries", () => Promise.resolve([]));

  const result = await client.request("getClient");
  const queries = await client.request("getV3Queries");

  expect(result).toEqual(defaultGetClient("1"));
  expect(queries).toEqual([]);
});

test("sends request without a target by default", () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  void client
    .withTimeout(10)
    .request("getClient")
    .catch(() => {});

  expect(source.mocks.messages[0].target).toBeUndefined();
});

test("sends client target with request when using withClientId", () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  void client
    .withTimeout(10)
    .withClientId("1")
    .request("getClient")
    .catch(() => {});

  expect(source.mocks.messages[0]).toMatchObject({
    type: MessageType.RPCRequest,
    name: "getClient",
    params: [],
    target: { type: "client", clientId: "1" },
  });
});

test("withClientId does not change the target of the original client", () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  const client1 = client.withClientId("1");
  const client2 = client.withClientId("2");

  expect(client.target).toBeUndefined();
  expect(client1.target).toEqual({ type: "client", clientId: "1" });
  expect(client2.target).toEqual({ type: "client", clientId: "2" });
});

test("resolves request sent with client target", async () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handle = createRpcHandler(new MessageAdapter(handlerSource));

  handle("getClient", () => defaultGetClient("1"));

  const result = await client.withClientId("1").request("getClient");

  expect(result).toEqual(defaultGetClient("1"));
});

test("handler responds with the target of the request", async () => {
  const source = createTestSource();
  const handle = createRpcHandler(new MessageAdapter(source));

  handle("getClient", () => defaultGetClient("1"));

  source.simulateDevtoolsMessage({
    type: MessageType.RPCRequest,
    id: "abc",
    target: { type: "client", clientId: "1" },
    name: "getClient",
    params: [],
  });

  await wait(0);

  expect(source.mocks.messages[0]).toMatchObject({
    type: MessageType.RPCResponse,
    sourceId: "abc",
    result: defaultGetClient("1"),
    target: { type: "client", clientId: "1" },
  });
});

test("sends client target when starting a stream with withClientId", () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  client.withClientId("1").stream("testStream", "1");

  expect(source.mocks.messages[0]).toMatchObject({
    type: MessageType.RPCStartStream,
    name: "testStream",
    target: { type: "client", clientId: "1" },
  });
});

test("sends aggregate requests with an aggregate target", () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  void client
    .withTimeout(10)
    .aggregate("getClient")
    .catch(() => {});

  const message = source.mocks.messages[0] as RPCRequestMessage;

  expect(message).toMatchObject({
    type: MessageType.RPCRequest,
    name: "getClient",
    params: [],
    target: { type: "aggregate", id: message.id },
  });
});

test("resolves aggregate request with results from all clients", async () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  const promise = client.aggregate("getClient");
  const { id } = source.mocks.messages[0] as RPCRequestMessage;

  source.simulateDevtoolsMessage({
    type: MessageType.AggregateResponse,
    target: { type: "aggregate", id },
    results: [
      {
        type: MessageType.RPCResponse,
        target: { type: "aggregate", id: id },
        sourceId: id,
        result: defaultGetClient("1"),
      },
      {
        type: MessageType.RPCResponse,
        target: { type: "aggregate", id: id },
        sourceId: id,
        result: defaultGetClient("2"),
      },
    ],
  });

  await expect(promise).resolves.toEqual([
    defaultGetClient("1"),
    defaultGetClient("2"),
  ]);
});

test("resolves aggregate request with empty array when there are no clients", async () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  const promise = client.aggregate("getClient");
  const { id } = source.mocks.messages[0] as RPCRequestMessage;

  source.simulateDevtoolsMessage({
    type: MessageType.AggregateResponse,
    target: { type: "aggregate", id },
    results: [],
  });

  await expect(promise).resolves.toEqual([]);
});

test("ignores aggregate responses for a different request", async () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  const promise = client.aggregate("getClient");
  const { id } = source.mocks.messages[0] as RPCRequestMessage;

  source.simulateDevtoolsMessage({
    type: MessageType.AggregateResponse,
    target: { type: "aggregate", id: id + "zzz" },
    results: [
      {
        type: MessageType.RPCResponse,
        target: { type: "aggregate", id: id + "zzz" },
        sourceId: id + "zzz",
        result: defaultGetClient("2"),
      },
    ],
  });

  source.simulateDevtoolsMessage({
    type: MessageType.AggregateResponse,
    target: { type: "aggregate", id },
    results: [
      {
        type: MessageType.RPCResponse,
        target: { type: "aggregate", id: id },
        sourceId: id,
        result: defaultGetClient("1"),
      },
    ],
  });

  await expect(promise).resolves.toEqual([defaultGetClient("1")]);
});

test("rejects aggregate request when any client responds with an error", async () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  const promise = client.aggregate("getClient");
  const { id } = source.mocks.messages[0] as RPCRequestMessage;

  source.simulateDevtoolsMessage({
    type: MessageType.AggregateResponse,
    target: { type: "aggregate", id },
    results: [
      {
        type: MessageType.RPCResponse,
        target: { type: "aggregate", id: id },
        sourceId: id,
        result: defaultGetClient("1"),
      },
      {
        type: MessageType.RPCResponse,
        target: { type: "aggregate", id: id },
        sourceId: id,
        error: serializeError(new Error("Could not get client")),
      },
    ],
  });

  await expect(promise).rejects.toEqual(new Error("Could not get client"));
});

test("rejects aggregate request when client has a client target", async () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  await expect(client.withClientId("1").aggregate("getClient")).rejects.toEqual(
    new Error("Cannot aggregate a request with client target")
  );
  expect(source.postMessage).not.toHaveBeenCalled();
});

test("times out aggregate request if no response received", async () => {
  jest.useFakeTimers();

  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  const promise = client.withTimeout(1000).aggregate("getClient");

  jest.advanceTimersByTime(1000);

  await expect(promise).rejects.toEqual(new Error(RPC_MESSAGE_TIMEOUT));

  jest.useRealTimers();
});

test("rejects aggregate request when provided signal aborts", async () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));
  const controller = new AbortController();

  const promise = client.withSignal(controller.signal).aggregate("getClient");

  controller.abort();

  await expect(promise).rejects.toEqual(
    new DOMException("The operation was aborted.", "AbortError")
  );
});

test("only allows one handler per type", async () => {
  const handle = createRpcHandler(new MessageAdapter(createTestSource()));

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
  // const handlerSource = createTestSource();
  // const clientSource = createTestSource();
  // createBridge(clientSource, handlerSource);
  //
  // const client = createRpcClient<Message>(new MessageAdapter(clientSource));
  // const handle = createRpcHandler<Message>(new MessageAdapter(handlerSource));
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
  const source = createTestSource();
  const handle = createRpcHandler(new MessageAdapter(source));

  const callback = jest.fn();
  handle("getClient", callback);

  source.simulatePlainMessage({ type: "getClient", clientId: "1" });

  expect(callback).not.toHaveBeenCalled();
});

// RPC messages always provide an `id`, but actor messages do not. In case an
// actor message type collides with an rpc message type, we want to ignore the
// actor message type.
test("ignores messages that aren't rpc messages", () => {
  const source = createTestSource();
  const handle = createRpcHandler(new MessageAdapter(source));

  const getClient = jest.fn();
  handle("getClient", getClient);

  source.simulatePlainMessage({
    id: createId(),
    source: "apollo-client-devtools",
    type: MessageType.Actor,
    payload: { type: "getClient", clientId: "1" },
  });

  expect(getClient).not.toHaveBeenCalled();
});

test("does not add listener to adapter until first subscribed handler", () => {
  const source = createTestSource();
  const handle = createRpcHandler(new MessageAdapter(source));

  expect(source.addListener).not.toHaveBeenCalled();

  handle("getClient", defaultGetClient);

  expect(source.addListener).toHaveBeenCalled();
});

test("can unsubscribe from a handler by calling the returned function", () => {
  const source = createTestSource();
  const handle = createRpcHandler(new MessageAdapter(source));

  const getClient = jest.fn();
  const unsubscribe = handle("getClient", getClient);

  source.simulateDevtoolsMessage({
    type: MessageType.RPCRequest,
    id: createId(),
    name: "getClient",
    params: [],
  });

  expect(getClient).toHaveBeenCalledTimes(1);

  getClient.mockClear();
  unsubscribe();

  source.simulateDevtoolsMessage({
    type: MessageType.RPCRequest,
    id: createId(),
    name: "getClient",
    params: [],
  });

  expect(getClient).not.toHaveBeenCalled();
});

test("removes listener on adapter when unsubscribing from last handler", () => {
  const source = createTestSource();
  const handle = createRpcHandler(new MessageAdapter(source));

  const unsubscribeGetClient = handle("getClient", defaultGetClient);
  const unsubscribeGetQueries = handle("getV3Queries", () => []);

  unsubscribeGetClient();
  expect(source.mocks.removeListener).not.toHaveBeenCalled();

  unsubscribeGetQueries();
  expect(source.mocks.removeListener).toHaveBeenCalledTimes(1);
});

test("re-adds listener on adapter when subscribing after unsubscribing", () => {
  const source = createTestSource();
  const handle = createRpcHandler(new MessageAdapter(source));

  const unsubscribe = handle("getClient", defaultGetClient);

  expect(source.addListener).toHaveBeenCalledTimes(1);

  unsubscribe();
  expect(source.mocks.removeListener).toHaveBeenCalledTimes(1);

  source.addListener.mockClear();

  handle("getClient", defaultGetClient);
  expect(source.addListener).toHaveBeenCalledTimes(1);
});

test("times out if no message received within default timeout", async () => {
  jest.useFakeTimers();

  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  const promise = client.request("getClient");

  jest.advanceTimersByTime(30_000);

  await expect(promise).rejects.toEqual(new Error(RPC_MESSAGE_TIMEOUT));

  jest.useRealTimers();
});

test("times out if no message received within configured timeout", async () => {
  jest.useFakeTimers();

  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  const promise = client.withTimeout(1000).request("getClient");

  jest.advanceTimersByTime(1000);

  await expect(promise).rejects.toEqual(new Error(RPC_MESSAGE_TIMEOUT));

  jest.useRealTimers();
});

test("resets timeout to default timeout after sending request", async () => {
  jest.useFakeTimers();

  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  const t1 = client.withTimeout(1000);
  const t2 = client.withTimeout(2000);

  expect(client.timeout).toBe(30_000);
  expect(t1.timeout).toBe(1000);
  expect(t2.timeout).toBe(2000);

  const finished = new Set<Promise<ApolloClientInfo | null>>();

  const promise1 = t1.request("getClient");
  promise1
    .finally(() => finished.add(promise1))
    .catch(() => {
      /* prevent unhandled rejection warning */
    });

  const promise2 = t2.request("getClient");
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

  const promise3 = client.request("getClient");
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
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));
  const controller = new AbortController();

  const promise = client.withSignal(controller.signal).request("getClient");

  await wait(10);
  controller.abort();

  await expect(promise).rejects.toEqual(
    new DOMException("The operation was aborted.", "AbortError")
  );
});

test("rejects when provided signal is already aborted", async () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));
  const controller = new AbortController();
  controller.abort();

  const promise = client.withSignal(controller.signal).request("getClient");

  await expect(promise).rejects.toEqual(
    new DOMException("The operation was aborted.", "AbortError")
  );
});

test("forwards abort reason if provided", async () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));
  const controller = new AbortController();

  const promise = client.withSignal(controller.signal).request("getClient");

  await wait(10);
  controller.abort("Manually aborted");

  await expect(promise).rejects.toEqual(
    new DOMException("Manually aborted", "AbortError")
  );
});

test("forwards rpc messages from one adapter to another with bridge", () => {
  const source1 = createTestSource();
  const source2 = createTestSource();

  createMessageBridge(new MessageAdapter(source1), new MessageAdapter(source2));

  source1.simulateDevtoolsMessage({
    id: "abc",
    type: MessageType.RPCRequest,
    name: "add",
    params: [{ x: 1, y: 2 }],
  });

  expect(source2.postMessage).toHaveBeenCalledTimes(1);
  expect(source2.postMessage).toHaveBeenCalledWith({
    source: "apollo-client-devtools",
    type: MessageType.RPCRequest,
    id: "abc",
    name: "add",
    params: [{ x: 1, y: 2 }],
  });

  source2.simulateDevtoolsMessage({
    id: "xyz",
    type: MessageType.RPCRequest,
    name: "add",
    params: [{ x: 1, y: 2 }],
  });

  expect(source1.postMessage).toHaveBeenCalledTimes(1);
  expect(source1.postMessage).toHaveBeenCalledWith({
    source: "apollo-client-devtools",
    type: MessageType.RPCRequest,
    id: "xyz",
    name: "add",
    params: [{ x: 1, y: 2 }],
  });
});

test("unsubscribes connection on bridge when calling returned function", () => {
  const source1 = createTestSource();
  const source2 = createTestSource();

  const unsubscribe = createMessageBridge(
    new MessageAdapter(source1),
    new MessageAdapter(source2)
  );

  source1.simulateDevtoolsMessage({
    id: "abc",
    type: MessageType.RPCRequest,
    name: "add",
    params: [{ x: 1, y: 2 }],
  });
  expect(source2.postMessage).toHaveBeenCalled();

  source2.simulateDevtoolsMessage({
    id: "xyz",
    type: MessageType.RPCRequest,
    name: "add",
    params: [{ x: 1, y: 2 }],
  });
  expect(source1.postMessage).toHaveBeenCalled();

  source1.postMessage.mockClear();
  source2.postMessage.mockClear();
  unsubscribe();

  source1.simulateDevtoolsMessage({
    id: "def",
    type: MessageType.RPCRequest,
    name: "add",
    params: [{ x: 1, y: 2 }],
  });
  expect(source2.postMessage).not.toHaveBeenCalled();

  source2.simulateDevtoolsMessage({
    id: "uvw",
    type: MessageType.RPCRequest,
    name: "add",
    params: [{ x: 1, y: 2 }],
  });
  expect(source1.postMessage).not.toHaveBeenCalled();
});

test("rejects with post message errors", async () => {
  const clientSource = createTestSource();
  const client = createRpcClient(new MessageAdapter(clientSource));

  const promise = client.request("getClient");

  const { id } = clientSource.mocks.messages[0] as RPCRequestMessage;

  clientSource.simulateDevtoolsMessage({
    type: MessageType.PostMessageError,
    sourceId: id,
    error: serializeError(new Error("Could not send")),
  });

  await expect(promise).rejects.toThrow(new Error("Could not send"));
});

test("ignores post message errors for a different rpc request", async () => {
  const clientSource = createTestSource();
  const client = createRpcClient(new MessageAdapter(clientSource));

  const promise = client.request("getClient");

  const { id } = clientSource.mocks.messages[0] as RPCRequestMessage;

  clientSource.simulateDevtoolsMessage({
    type: MessageType.PostMessageError,
    sourceId: id + "zzz",
    error: serializeError(new Error("Could not send")),
  });

  clientSource.simulateRPCResponse({
    sourceId: id,
    result: defaultGetClient("1"),
  });

  await expect(promise).resolves.toEqual(defaultGetClient("1"));
});

test("can stream messages from adapter", async () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  const stream = client.stream("testStream", "1");
  const reader = stream.getReader();
  const { id } = source.mocks.messages[0] as RPCStreamStartMessage;

  source.simulateRPCStreamChunk<TestStreamValue>(id, {
    id: "1",
    value: true,
  });
  source.simulateRPCStreamChunk<TestStreamValue>(id, {
    id: "1",
    value: false,
  });

  await expect(reader.read()).resolves.toEqual({
    value: {
      id: "1",
      value: true,
    },
    done: false,
  });
  await expect(reader.read()).resolves.toEqual({
    value: {
      id: "1",
      value: false,
    },
    done: false,
  });
});

test("closes stream when abort controller aborts", async () => {
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));
  const controller = new AbortController();

  const stream = client.withSignal(controller.signal).stream("testStream", "1");
  const reader = stream.getReader();
  const { id } = source.mocks.messages[0] as RPCStreamStartMessage;

  source.simulateRPCStreamChunk<TestStreamValue>(id, {
    id: "1",
    value: true,
  });

  await expect(reader.read()).resolves.toEqual({
    value: {
      id: "1",
      value: true,
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
  const source = createTestSource();
  const client = createRpcClient(new MessageAdapter(source));

  const stream = client.stream("testStream", "1");
  const reader = stream.getReader();

  source.simulateRPCStreamChunk<TestStreamValue>("xyz", {
    id: "xyz",
    value: true,
  });

  const promise = Promise.race([
    reader.read(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 10)
    ),
  ]);

  await expect(promise).rejects.toThrow(new Error("Timeout"));
});

test("can handle rpc streams and send messages back", async () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handleRpcStream = createRpcStreamHandler(
    new MessageAdapter(handlerSource)
  );

  handleRpcStream("testStream", ({ push }, id) => {
    push({ id, value: true });
    push({ id, value: false });
  });

  const stream = client.stream("testStream", "1");
  const reader = stream.getReader();

  await expect(reader.read()).resolves.toEqual({
    value: { id: "1", value: true },
    done: false,
  });
  await expect(reader.read()).resolves.toEqual({
    value: { id: "1", value: false },
    done: false,
  });
});

test("can create multiple streams with same handler", async () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handleRpcStream = createRpcStreamHandler(
    new MessageAdapter(handlerSource)
  );

  handleRpcStream("testStream", ({ push }, id) => {
    push({ id, value: id === "1" });
  });

  const stream1 = client.stream("testStream", "1");
  const stream2 = client.stream("testStream", "2");
  const reader1 = stream1.getReader();
  const reader2 = stream2.getReader();

  await expect(reader1.read()).resolves.toEqual({
    value: { id: "1", value: true },
    done: false,
  });

  await expect(reader2.read()).resolves.toEqual({
    value: { id: "2", value: false },
    done: false,
  });
});

test("only calls the stream handler matching the stream name", async () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handleRpcStream = createRpcStreamHandler(
    new MessageAdapter(handlerSource)
  );

  const handleTestStream = jest.fn(({ push }, id) => {
    push({ id, value: true });
  });
  const handleOtherTestStream = jest.fn();

  handleRpcStream("testStream", handleTestStream);
  handleRpcStream("otherTestStream", handleOtherTestStream);

  const stream = client.stream("testStream", "1");
  const reader = stream.getReader();

  expect(handleTestStream).toHaveBeenCalledTimes(1);
  expect(handleOtherTestStream).not.toHaveBeenCalled();

  await expect(reader.read()).resolves.toEqual({
    value: { id: "1", value: true },
    done: false,
  });
});

test("can start a new stream after a previous stream terminates", async () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  const controller = new AbortController();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handleRpcStream = createRpcStreamHandler(
    new MessageAdapter(handlerSource)
  );

  const handler = jest.fn(({ push }, id) => {
    push({ id, value: true });
  });
  handleRpcStream("testStream", handler);

  client.withSignal(controller.signal).stream("testStream", "1");
  controller.abort();

  expect(handler).toHaveBeenCalledTimes(1);

  const stream = client.stream("testStream", "2");
  const reader = stream.getReader();

  expect(handler).toHaveBeenCalledTimes(2);

  await expect(reader.read()).resolves.toEqual({
    value: { id: "2", value: true },
    done: false,
  });
});

test("cleanup function is called when the stream terminates", async () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  const controller = new AbortController();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource)).withSignal(
    controller.signal
  );
  const handleRpcStream = createRpcStreamHandler(
    new MessageAdapter(handlerSource)
  );

  const cleanup = jest.fn();
  handleRpcStream("testStream", () => cleanup);

  client.stream("testStream", "1");
  controller.abort();

  expect(cleanup).toHaveBeenCalledTimes(1);
});

test("calls cleanup function when unsubscribing stream handler", async () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handleRpcStream = createRpcStreamHandler(
    new MessageAdapter(handlerSource)
  );

  const cleanup = jest.fn();
  const unsubscribe = handleRpcStream("testStream", () => cleanup);
  client.stream("testStream", "1");

  unsubscribe();
  expect(cleanup).toHaveBeenCalledTimes(1);
});

test("runs cleanup only on terminated handler", async () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  const controller = new AbortController();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handleRpcStream = createRpcStreamHandler(
    new MessageAdapter(handlerSource)
  );

  const cleanup = jest.fn();
  handleRpcStream("testStream", ({ push }, id) => {
    wait(50).then(() => {
      push({ id, value: true });
    });

    return () => cleanup(id);
  });

  const stream = client.stream("testStream", "1");
  const reader = stream.getReader();
  client.withSignal(controller.signal).stream("testStream", "2");

  controller.abort();

  expect(cleanup).toHaveBeenCalledTimes(1);
  expect(cleanup).toHaveBeenCalledWith("2");

  await expect(reader.read()).resolves.toEqual({
    value: { id: "1", value: true },
    done: false,
  });
});

test("runs cleanup and closes stream when calling close", async () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handleRpcStream = createRpcStreamHandler(
    new MessageAdapter(handlerSource)
  );

  const cleanup = jest.fn();
  handleRpcStream("testStream", ({ push, close }, id) => {
    push({ id, value: true });
    requestAnimationFrame(close);

    return () => cleanup(id);
  });

  const stream = client.stream("testStream", "1");
  const reader = stream.getReader();

  await expect(reader.read()).resolves.toEqual({
    value: { id: "1", value: true },
    done: false,
  });

  await wait(20);

  expect(cleanup).toHaveBeenCalledTimes(1);
  expect(cleanup).toHaveBeenCalledWith("1");

  await expect(reader.read()).resolves.toEqual({
    value: undefined,
    done: true,
  });
});

test("runs cleanup for all active streams when adapter disconnects", () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const handlerAdapter = new MessageAdapter(handlerSource);
  const client = createRpcClient(new MessageAdapter(clientSource));
  const handleRpcStream = createRpcStreamHandler(handlerAdapter);

  const cleanup = jest.fn();
  handleRpcStream("testStream", (_, id) => () => cleanup(id));

  client.stream("testStream", "1");
  client.stream("testStream", "2");

  handlerAdapter.disconnect();

  expect(cleanup).toHaveBeenCalledTimes(2);
  expect(cleanup).toHaveBeenCalledWith("1");
  expect(cleanup).toHaveBeenCalledWith("2");
});

test("does not push stream values after adapter disconnects", async () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const handlerAdapter = new MessageAdapter(handlerSource);
  const client = createRpcClient(new MessageAdapter(clientSource));
  const handleRpcStream = createRpcStreamHandler(handlerAdapter);

  let push!: (value: TestStreamValue) => void;
  handleRpcStream("testStream", (controller) => {
    push = controller.push;
  });

  client.stream("testStream", "1");
  handlerAdapter.disconnect();
  handlerSource.postMessage.mockClear();

  push({ id: "1", value: true });
  await wait(10);

  expect(handlerSource.postMessage).not.toHaveBeenCalled();
});

test("runs cleanup for all active streams when devtools disconnects", () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handleRpcStream = createRpcStreamHandler(
    new MessageAdapter(handlerSource)
  );

  const cleanup = jest.fn();
  handleRpcStream("testStream", (_, id) => () => cleanup(id));

  client.stream("testStream", "1");
  client.stream("testStream", "2");

  handlerSource.simulateDevtoolsMessage({
    type: MessageType.DevtoolsDisconnected,
  });

  expect(cleanup).toHaveBeenCalledTimes(2);
  expect(cleanup).toHaveBeenCalledWith("1");
  expect(cleanup).toHaveBeenCalledWith("2");
});

test("handles new streams after devtools disconnects", async () => {
  const handlerSource = createTestSource();
  const clientSource = createTestSource();
  createBridge(clientSource, handlerSource);

  const client = createRpcClient(new MessageAdapter(clientSource));
  const handleRpcStream = createRpcStreamHandler(
    new MessageAdapter(handlerSource)
  );

  handleRpcStream("testStream", ({ push }, id) => {
    push({ id, value: true });
  });

  handlerSource.simulateDevtoolsMessage({
    type: MessageType.DevtoolsDisconnected,
  });

  const reader = client.stream("testStream", "1").getReader();

  await expect(reader.read()).resolves.toEqual({
    value: { id: "1", value: true },
    done: false,
  });
});
