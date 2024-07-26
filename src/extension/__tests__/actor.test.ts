import { createActor } from "../actor";
import { MessageType } from "../messages";

function createTestAdapter<Messages = unknown>() {
  let listener: ((message: unknown) => void) | null;
  const removeListener = jest.fn(() => {
    listener = null;
  });

  return {
    mocks: { removeListener },
    simulatePlainMessage: (message: unknown) => {
      listener?.(message);
    },
    simulateDevtoolsMessage: (message: Messages) => {
      listener?.({
        source: "apollo-client-devtools",
        type: MessageType.Event,
        message,
      });
    },
    addListener: jest.fn((fn) => {
      listener = fn;

      return removeListener;
    }),
    postMessage: jest.fn(),
  };
}

test("sends messages to specified adapter in devtools message format", () => {
  type Message = { type: "test"; payload: string };

  const adapter = createTestAdapter();
  const actor = createActor<Message>(adapter);

  actor.send({ type: "test", payload: "Hello" });

  expect(adapter.postMessage).toHaveBeenCalledWith({
    id: expect.any(String),
    source: "apollo-client-devtools",
    type: MessageType.Event,
    message: {
      type: "test",
      payload: "Hello",
    },
  });
});

test("calls message callback when subscribing to a message", () => {
  type Message = { type: "connect"; payload: string } | { type: "disconnect" };

  const adapter = createTestAdapter<Message>();
  const actor = createActor<Message>(adapter);

  const handleConnect = jest.fn();
  const handleDisconnect = jest.fn();

  actor.on("connect", handleConnect);
  actor.on("disconnect", handleDisconnect);

  adapter.simulateDevtoolsMessage({
    type: "connect",
    payload: "Connected!",
  });

  expect(handleConnect).toHaveBeenCalledTimes(1);
  expect(handleConnect).toHaveBeenCalledWith({
    type: "connect",
    payload: "Connected!",
  });
  expect(handleDisconnect).not.toHaveBeenCalled();

  adapter.simulateDevtoolsMessage({ type: "disconnect" });
  adapter.simulateDevtoolsMessage({ type: "disconnect" });

  expect(handleDisconnect).toHaveBeenCalledTimes(2);
  expect(handleDisconnect).toHaveBeenCalledWith({ type: "disconnect" });
});

test("calls all listeners for the same message", () => {
  type Message = { type: "test" };

  const adapter = createTestAdapter<Message>();
  const actor = createActor<Message>(adapter);

  const handleMessage = jest.fn();
  const handleMessage2 = jest.fn();
  const handleMessage3 = jest.fn();

  actor.on("test", handleMessage);
  actor.on("test", handleMessage2);
  actor.on("test", handleMessage3);

  adapter.simulateDevtoolsMessage({ type: "test" });

  expect(handleMessage).toHaveBeenCalledTimes(1);
  expect(handleMessage2).toHaveBeenCalledTimes(1);
  expect(handleMessage3).toHaveBeenCalledTimes(1);
});

test("ignores messages that don't originate from devtools", () => {
  type Message = { type: "test" };
  const adapter = createTestAdapter();
  const actor = createActor<Message>(adapter);

  const handleMessage = jest.fn();
  actor.on("test", handleMessage);

  adapter.simulatePlainMessage({ type: "test" });

  expect(handleMessage).not.toHaveBeenCalled();
});

test.each([MessageType.RPCRequest, MessageType.RPCResponse])(
  "ignores messages that are %s messages",
  (messageType) => {
    type Message = { type: "test" };
    const adapter = createTestAdapter();
    const actor = createActor<Message>(adapter);

    const handleMessage = jest.fn();
    actor.on("test", handleMessage);

    adapter.simulatePlainMessage({
      source: "apollo-client-devtools",
      type: messageType,
      message: { type: "test" },
    });

    expect(handleMessage).not.toHaveBeenCalled();
  }
);

test("does not add listener to adapter until first subscribed actor listener", () => {
  type Message = { type: "test" };

  const adapter = createTestAdapter();
  const actor = createActor<Message>(adapter);

  expect(adapter.addListener).not.toHaveBeenCalled();

  actor.send({ type: "test" });
  expect(adapter.addListener).not.toHaveBeenCalled();

  actor.on("test", () => {});
  expect(adapter.addListener).toHaveBeenCalledTimes(1);
});

test("adds a single listener to adapter regardless of subscribed actor listeners", () => {
  type Message =
    | { type: "test" }
    | { type: "greet" }
    | { type: "connect" }
    | { type: "disconnect" };

  const adapter = createTestAdapter();
  const actor = createActor<Message>(adapter);

  actor.on("test", () => {});
  actor.on("greet", () => {});
  actor.on("disconnect", () => {});
  actor.on("connect", () => {});

  expect(adapter.addListener).toHaveBeenCalledTimes(1);
});

test("can unsubscribe from a message by calling the returned function", () => {
  type Message = { type: "test" };
  const adapter = createTestAdapter<Message>();
  const actor = createActor<Message>(adapter);

  const handleMessage = jest.fn();
  const unsubscribe = actor.on("test", handleMessage);

  adapter.simulateDevtoolsMessage({ type: "test" });

  expect(handleMessage).toHaveBeenCalledTimes(1);

  handleMessage.mockClear();
  unsubscribe();

  adapter.simulateDevtoolsMessage({ type: "test" });

  expect(handleMessage).not.toHaveBeenCalled();
});

test("removes listener on adapter when unsubscribing from last actor listener", () => {
  type Message = { type: "connect" } | { type: "disconnect" };
  const adapter = createTestAdapter<Message>();
  const actor = createActor<Message>(adapter);

  const handleConnect = jest.fn();
  const handleDisconnect = jest.fn();
  const unsubscribeConnect = actor.on("connect", handleConnect);
  const unsubscribeDisconnect = actor.on("connect", handleDisconnect);

  unsubscribeConnect();

  expect(adapter.mocks.removeListener).not.toHaveBeenCalled();

  unsubscribeDisconnect();

  expect(adapter.mocks.removeListener).toHaveBeenCalledTimes(1);
});

test("re-adds listener on adapter when subscribing actor listener after disconnecting", () => {
  type Message = { type: "connect" };
  const adapter = createTestAdapter<Message>();
  const actor = createActor<Message>(adapter);

  const handleConnect = jest.fn();
  const unsubscribeConnect = actor.on("connect", handleConnect);

  expect(adapter.addListener).toHaveBeenCalledTimes(1);

  unsubscribeConnect();
  expect(adapter.mocks.removeListener).toHaveBeenCalled();

  adapter.addListener.mockClear();

  actor.on("connect", handleConnect);
  expect(adapter.addListener).toHaveBeenCalledTimes(1);
});
