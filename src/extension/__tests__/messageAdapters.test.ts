import { createTestSource } from "@/testUtils/createTestSource";
import { MessageAdapter } from "../messageAdapters";
import { MessageType } from "../messages";

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
