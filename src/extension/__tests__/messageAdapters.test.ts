import { createId } from "@/utils/createId";
import { createTestSource } from "@/testUtils/createTestSource";
import { MessageAdapter } from "../messageAdapters";
import { MessageType } from "../messages";

const originalReportError = globalThis.reportError;

afterEach(() => {
  globalThis.reportError = originalReportError;
  jest.restoreAllMocks();
});

test("sends messages to the source in devtools message format", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  adapter.postMessage({
    type: MessageType.Actor,
    message: { type: "clientTerminated", clientId: "1" },
  });

  expect(source.postMessage).toHaveBeenCalledTimes(1);
  expect(source.postMessage).toHaveBeenCalledWith({
    id: expect.any(String),
    source: "apollo-client-devtools",
    type: MessageType.Actor,
    message: { type: "clientTerminated", clientId: "1" },
  });
});

test("generates a unique id for each sent message", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  adapter.postMessage({
    type: MessageType.Actor,
    message: { type: "clientTerminated", clientId: "1" },
  });
  adapter.postMessage({
    type: MessageType.Actor,
    message: { type: "clientTerminated", clientId: "1" },
  });

  const [message1, message2] = source.mocks.messages;

  expect(message1.id).not.toBe(message2.id);
});

test("preserves the id when one is provided", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  adapter.postMessage({
    type: MessageType.RPCRequest,
    id: "abc",
    name: "getClients",
    params: [],
  });

  expect(source.postMessage).toHaveBeenCalledWith({
    id: "abc",
    source: "apollo-client-devtools",
    type: MessageType.RPCRequest,
    name: "getClients",
    params: [],
  });
});

test("sends the message as-is when not using jsonSerialize", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);
  const url = new URL("https://example.com");

  adapter.postMessage({
    type: MessageType.RPCRequest,
    id: "abc",
    name: "getClients",
    params: [url],
  });

  const [[message]] = source.postMessage.mock.calls;

  expect(message.params[0]).toBe(url);
});

test("JSON serializes the message when using jsonSerialize", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter({ ...source, jsonSerialize: true });

  adapter.postMessage({
    type: MessageType.RPCRequest,
    id: "abc",
    name: "getClients",
    params: [new URL("https://example.com"), undefined],
  });

  expect(source.postMessage).toHaveBeenCalledWith({
    id: "abc",
    source: "apollo-client-devtools",
    type: MessageType.RPCRequest,
    name: "getClients",
    params: ["https://example.com/", null],
  });
});

test("calls listener with devtools messages", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleMessage = jest.fn();
  adapter.addListener(handleMessage);

  source.simulateActorMessage({ type: "initializePanel", initialContext: {} });

  expect(handleMessage).toHaveBeenCalledTimes(1);
  expect(handleMessage).toHaveBeenCalledWith({
    id: expect.any(String),
    source: "apollo-client-devtools",
    type: MessageType.Actor,
    message: { type: "initializePanel", initialContext: {} },
  });
});

test("calls all listeners for the same message", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleMessage = jest.fn();
  const handleMessage2 = jest.fn();
  const handleMessage3 = jest.fn();

  adapter.addListener(handleMessage);
  adapter.addListener(handleMessage2);
  adapter.addListener(handleMessage3);

  source.simulateActorMessage({ type: "initializePanel", initialContext: {} });

  expect(handleMessage).toHaveBeenCalledTimes(1);
  expect(handleMessage2).toHaveBeenCalledTimes(1);
  expect(handleMessage3).toHaveBeenCalledTimes(1);
});

test.each([
  ["plain objects", { type: "initializePanel" }],
  ["objects from other sources", { source: "other", type: MessageType.Actor }],
  ["null", null],
  ["undefined", undefined],
  ["strings", "apollo-client-devtools"],
  ["numbers", 1],
])("ignores %s", (_, message) => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleMessage = jest.fn();
  adapter.addListener(handleMessage);

  source.simulatePlainMessage(message);

  expect(handleMessage).not.toHaveBeenCalled();
});

test("does not add listener to source until first adapter listener", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  expect(source.addListener).not.toHaveBeenCalled();

  adapter.postMessage({
    type: MessageType.Actor,
    message: { type: "clientTerminated", clientId: "1" },
  });
  expect(source.addListener).not.toHaveBeenCalled();

  adapter.addListener(() => {});
  expect(source.addListener).toHaveBeenCalledTimes(1);
});

test("adds a single listener to source regardless of adapter listeners", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  adapter.addListener(() => {});
  adapter.addListener(() => {});
  adapter.addListener(() => {});

  expect(source.addListener).toHaveBeenCalledTimes(1);
});

test("can unsubscribe by calling the returned function", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleMessage = jest.fn();
  const handleMessage2 = jest.fn();
  const unsubscribe = adapter.addListener(handleMessage);
  adapter.addListener(handleMessage2);

  source.simulateActorMessage({ type: "initializePanel", initialContext: {} });

  expect(handleMessage).toHaveBeenCalledTimes(1);
  expect(handleMessage2).toHaveBeenCalledTimes(1);

  handleMessage.mockClear();
  handleMessage2.mockClear();
  unsubscribe();

  source.simulateActorMessage({ type: "initializePanel", initialContext: {} });

  expect(handleMessage).not.toHaveBeenCalled();
  expect(handleMessage2).toHaveBeenCalledTimes(1);
});

test("removes listener on source when unsubscribing last adapter listener", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const unsubscribe1 = adapter.addListener(() => {});
  const unsubscribe2 = adapter.addListener(() => {});

  unsubscribe1();

  expect(source.mocks.removeListener).not.toHaveBeenCalled();

  unsubscribe2();

  expect(source.mocks.removeListener).toHaveBeenCalledTimes(1);
});

test("removes listener on source regardless of unsubscribe order", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const unsubscribe1 = adapter.addListener(() => {});
  const unsubscribe2 = adapter.addListener(() => {});
  const unsubscribe3 = adapter.addListener(() => {});

  unsubscribe2();
  unsubscribe1();

  expect(source.mocks.removeListener).not.toHaveBeenCalled();

  unsubscribe3();

  expect(source.mocks.removeListener).toHaveBeenCalledTimes(1);
});

test("re-adds listener on source when subscribing after disconnecting", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleMessage = jest.fn();
  const unsubscribe = adapter.addListener(handleMessage);

  expect(source.addListener).toHaveBeenCalledTimes(1);

  unsubscribe();
  expect(source.mocks.removeListener).toHaveBeenCalledTimes(1);

  source.addListener.mockClear();

  adapter.addListener(handleMessage);
  expect(source.addListener).toHaveBeenCalledTimes(1);

  source.simulateActorMessage({ type: "initializePanel", initialContext: {} });

  expect(handleMessage).toHaveBeenCalledTimes(1);
});

test("only removes listener on source once when unsubscribing multiple times", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const unsubscribe = adapter.addListener(() => {});

  unsubscribe();
  unsubscribe();

  expect(source.mocks.removeListener).toHaveBeenCalledTimes(1);
});

test("on: calls listener with messages matching the given type", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleMessage = jest.fn();
  adapter.on(MessageType.Actor, handleMessage);

  source.simulateActorMessage({ type: "clientTerminated", clientId: "1" });

  expect(handleMessage).toHaveBeenCalledTimes(1);
  expect(handleMessage).toHaveBeenCalledWith({
    id: expect.any(String),
    source: "apollo-client-devtools",
    type: MessageType.Actor,
    message: { type: "clientTerminated", clientId: "1" },
  });
});

test("on: ignores messages that don't match the given type", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleMessage = jest.fn();
  adapter.on(MessageType.Actor, handleMessage);

  source.simulateRPCResponse({ sourceId: "abc", result: null });
  source.simulateRPCStreamChunk("abc", { value: true });
  source.simulateDevtoolsMessage({
    type: MessageType.RPCRequest,
    id: createId(),
    name: "getClient",
    params: ["1"],
  });

  expect(handleMessage).not.toHaveBeenCalled();
});

test("on: ignores messages that don't originate from devtools", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleMessage = jest.fn();
  adapter.on(MessageType.Actor, handleMessage);

  source.simulatePlainMessage({
    type: MessageType.Actor,
    message: { type: "clientTerminated", clientId: "1" },
  });

  expect(handleMessage).not.toHaveBeenCalled();
});

test("on: routes messages to listeners for each type", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleActor = jest.fn();
  const handleResponse = jest.fn();
  adapter.on(MessageType.Actor, handleActor);
  adapter.on(MessageType.RPCResponse, handleResponse);

  source.simulateActorMessage({ type: "clientTerminated", clientId: "1" });

  expect(handleActor).toHaveBeenCalledTimes(1);
  expect(handleResponse).not.toHaveBeenCalled();

  handleActor.mockClear();

  source.simulateRPCResponse({ sourceId: "abc", result: 1 });

  expect(handleActor).not.toHaveBeenCalled();
  expect(handleResponse).toHaveBeenCalledTimes(1);
  expect(handleResponse).toHaveBeenCalledWith({
    id: expect.any(String),
    source: "apollo-client-devtools",
    type: MessageType.RPCResponse,
    sourceId: "abc",
    result: 1,
  });
});

test("on: calls all listeners for the same type", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleMessage = jest.fn();
  const handleMessage2 = jest.fn();
  adapter.on(MessageType.Actor, handleMessage);
  adapter.on(MessageType.Actor, handleMessage2);

  source.simulateActorMessage({ type: "clientTerminated", clientId: "1" });

  expect(handleMessage).toHaveBeenCalledTimes(1);
  expect(handleMessage2).toHaveBeenCalledTimes(1);
});

test("on: calls both typed and untyped listeners for the same message", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleTyped = jest.fn();
  const handleAll = jest.fn();
  adapter.on(MessageType.Actor, handleTyped);
  adapter.addListener(handleAll);

  source.simulateActorMessage({ type: "clientTerminated", clientId: "1" });

  expect(handleTyped).toHaveBeenCalledTimes(1);
  expect(handleAll).toHaveBeenCalledTimes(1);
});

test("on: adds a single listener to source regardless of typed listeners", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  expect(source.addListener).not.toHaveBeenCalled();

  adapter.on(MessageType.Actor, () => {});
  adapter.on(MessageType.RPCResponse, () => {});
  adapter.on(MessageType.RPCStreamChunk, () => {});
  adapter.addListener(() => {});

  expect(source.addListener).toHaveBeenCalledTimes(1);
});

test("on: can unsubscribe by calling the returned function", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleMessage = jest.fn();
  const handleMessage2 = jest.fn();
  const unsubscribe = adapter.on(MessageType.Actor, handleMessage);
  adapter.on(MessageType.Actor, handleMessage2);

  unsubscribe();

  source.simulateActorMessage({ type: "clientTerminated", clientId: "1" });

  expect(handleMessage).not.toHaveBeenCalled();
  expect(handleMessage2).toHaveBeenCalledTimes(1);
});

test("on: treats each call as a separate subscription for the same listener", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleMessage = jest.fn();
  const unsubscribe = adapter.on(MessageType.Actor, handleMessage);
  adapter.on(MessageType.Actor, handleMessage);

  source.simulateActorMessage({ type: "clientTerminated", clientId: "1" });

  expect(handleMessage).toHaveBeenCalledTimes(2);

  handleMessage.mockClear();
  unsubscribe();

  source.simulateActorMessage({ type: "clientTerminated", clientId: "1" });

  expect(handleMessage).toHaveBeenCalledTimes(1);
});

test("on: removes listener on source when unsubscribing last listener", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const unsubscribe1 = adapter.on(MessageType.Actor, () => {});
  const unsubscribe2 = adapter.on(MessageType.RPCResponse, () => {});
  const unsubscribe3 = adapter.addListener(() => {});

  unsubscribe1();
  unsubscribe3();

  expect(source.mocks.removeListener).not.toHaveBeenCalled();

  unsubscribe2();

  expect(source.mocks.removeListener).toHaveBeenCalledTimes(1);
});

test("on: re-adds listener on source when subscribing after disconnecting", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleMessage = jest.fn();
  const unsubscribe = adapter.on(MessageType.Actor, handleMessage);

  unsubscribe();
  expect(source.mocks.removeListener).toHaveBeenCalledTimes(1);

  source.addListener.mockClear();

  adapter.on(MessageType.Actor, handleMessage);
  expect(source.addListener).toHaveBeenCalledTimes(1);

  source.simulateActorMessage({ type: "clientTerminated", clientId: "1" });

  expect(handleMessage).toHaveBeenCalledTimes(1);
});

test("on: only removes listener on source once when unsubscribing multiple times", () => {
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const unsubscribe = adapter.on(MessageType.Actor, () => {});

  unsubscribe();
  unsubscribe();

  expect(source.mocks.removeListener).toHaveBeenCalledTimes(1);
});

test("continues calling remaining listeners when a listener throws", () => {
  globalThis.reportError = jest.fn();
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleMessage = jest.fn();
  adapter.addListener(() => {
    throw new Error("Oops");
  });
  adapter.addListener(handleMessage);

  source.simulateActorMessage({ type: "clientTerminated", clientId: "1" });

  expect(handleMessage).toHaveBeenCalledTimes(1);
});

test("continues calling remaining listeners registered with on when a listener throws", () => {
  globalThis.reportError = jest.fn();
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const handleMessage = jest.fn();
  adapter.on(MessageType.Actor, () => {
    throw new Error("Oops");
  });
  adapter.on(MessageType.Actor, handleMessage);

  source.simulateActorMessage({ type: "clientTerminated", clientId: "1" });

  expect(handleMessage).toHaveBeenCalledTimes(1);
});

test("reports errors thrown by listeners with reportError", () => {
  const reportError = jest.fn();
  globalThis.reportError = reportError;
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const error = new Error("Oops");
  adapter.addListener(() => {
    throw error;
  });

  source.simulateActorMessage({ type: "clientTerminated", clientId: "1" });

  expect(reportError).toHaveBeenCalledTimes(1);
  expect(reportError).toHaveBeenCalledWith(error);
});

test("rethrows errors thrown by listeners in a microtask when reportError is unavailable", () => {
  // @ts-expect-error simulating environments without reportError (Node)
  globalThis.reportError = undefined;
  const queueMicrotask = jest
    .spyOn(globalThis, "queueMicrotask")
    .mockImplementation(() => {});
  const source = createTestSource();
  const adapter = new MessageAdapter(source);

  const error = new Error("Oops");
  adapter.addListener(() => {
    throw error;
  });

  source.simulateActorMessage({ type: "clientTerminated", clientId: "1" });

  expect(queueMicrotask).toHaveBeenCalledTimes(1);

  const [[callback]] = queueMicrotask.mock.calls;

  expect(callback).toThrow(error);
});
