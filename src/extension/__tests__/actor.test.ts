import { createActor } from "../actor";
import { MessageType } from "../messages";

function createTestAdapter() {
  let listener: ((message: unknown) => void) | null;
  const removeListener = jest.fn(() => {
    listener = null;
  });

  return {
    mocks: { removeListener },
    simulatePlainMessage: (message: unknown) => {
      listener?.(message);
    },
    simulateDevtoolsMessage: (message: Record<string, unknown>) => {
      listener?.({
        source: "apollo-client-devtools",
        type: MessageType.Actor,
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
  const adapter = createTestAdapter();
  const actor = createActor(adapter);

  actor.send({ type: "clientTerminated", clientId: "1" });

  expect(adapter.postMessage).toHaveBeenCalledWith({
    id: expect.any(String),
    source: "apollo-client-devtools",
    type: MessageType.Actor,
    message: {
      type: "clientTerminated",
      clientId: "1",
    },
  });
});

test("calls message callback when subscribing to a message", () => {
  const adapter = createTestAdapter();
  const actor = createActor(adapter);

  const handleConnect = jest.fn();
  const handleDisconnect = jest.fn();

  actor.on("initializePanel", handleConnect);
  actor.on("clientTerminated", handleDisconnect);

  adapter.simulateDevtoolsMessage({ type: "initializePanel" });

  expect(handleConnect).toHaveBeenCalledTimes(1);
  expect(handleConnect).toHaveBeenCalledWith({ type: "initializePanel" });
  expect(handleDisconnect).not.toHaveBeenCalled();

  adapter.simulateDevtoolsMessage({ type: "clientTerminated", clientId: "1" });
  adapter.simulateDevtoolsMessage({ type: "clientTerminated", clientId: "2" });

  expect(handleDisconnect).toHaveBeenCalledTimes(2);
  expect(handleDisconnect).toHaveBeenCalledWith({
    type: "clientTerminated",
    clientId: "1",
  });
  expect(handleDisconnect).toHaveBeenCalledWith({
    type: "clientTerminated",
    clientId: "2",
  });
});

test("calls all listeners for the same message", () => {
  const adapter = createTestAdapter();
  const actor = createActor(adapter);

  const handleMessage = jest.fn();
  const handleMessage2 = jest.fn();
  const handleMessage3 = jest.fn();

  actor.on("initializePanel", handleMessage);
  actor.on("initializePanel", handleMessage2);
  actor.on("initializePanel", handleMessage3);

  adapter.simulateDevtoolsMessage({ type: "initializePanel" });

  expect(handleMessage).toHaveBeenCalledTimes(1);
  expect(handleMessage2).toHaveBeenCalledTimes(1);
  expect(handleMessage3).toHaveBeenCalledTimes(1);
});

test("ignores messages that don't originate from devtools", () => {
  const adapter = createTestAdapter();
  const actor = createActor(adapter);

  const handleMessage = jest.fn();
  actor.on("initializePanel", handleMessage);

  adapter.simulatePlainMessage({ type: "initializePanel" });

  expect(handleMessage).not.toHaveBeenCalled();
});

test.each([MessageType.RPCRequest, MessageType.RPCResponse])(
  "ignores messages that are %s messages",
  (messageType) => {
    const adapter = createTestAdapter();
    const actor = createActor(adapter);

    const handleMessage = jest.fn();
    actor.on("initializePanel", handleMessage);

    adapter.simulatePlainMessage({
      source: "apollo-client-devtools",
      type: messageType,
      message: { type: "initializePanel" },
    });

    expect(handleMessage).not.toHaveBeenCalled();
  }
);

test("does not add listener to adapter until first subscribed actor listener", () => {
  const adapter = createTestAdapter();
  const actor = createActor(adapter);

  expect(adapter.addListener).not.toHaveBeenCalled();

  actor.send({ type: "initializePanel", initialContext: {} });
  expect(adapter.addListener).not.toHaveBeenCalled();

  actor.on("initializePanel", () => {});
  expect(adapter.addListener).toHaveBeenCalledTimes(1);
});

test("adds a single listener to adapter regardless of subscribed actor listeners", () => {
  const adapter = createTestAdapter();
  const actor = createActor(adapter);

  actor.on("initializePanel", () => {});
  actor.on("registerClient", () => {});
  actor.on("clientTerminated", () => {});
  actor.on("panelShown", () => {});

  expect(adapter.addListener).toHaveBeenCalledTimes(1);
});

test("can unsubscribe from a message by calling the returned function", () => {
  const adapter = createTestAdapter();
  const actor = createActor(adapter);

  const handleMessage = jest.fn();
  const unsubscribe = actor.on("initializePanel", handleMessage);

  adapter.simulateDevtoolsMessage({ type: "initializePanel" });

  expect(handleMessage).toHaveBeenCalledTimes(1);

  handleMessage.mockClear();
  unsubscribe();

  adapter.simulateDevtoolsMessage({ type: "initializePanel" });

  expect(handleMessage).not.toHaveBeenCalled();
});

test("removes listener on adapter when unsubscribing from last actor listener", () => {
  const adapter = createTestAdapter();
  const actor = createActor(adapter);

  const handleConnect = jest.fn();
  const handleDisconnect = jest.fn();
  const unsubscribeConnect = actor.on("initializePanel", handleConnect);
  const unsubscribeDisconnect = actor.on("clientTerminated", handleDisconnect);

  unsubscribeConnect();

  expect(adapter.mocks.removeListener).not.toHaveBeenCalled();

  unsubscribeDisconnect();

  expect(adapter.mocks.removeListener).toHaveBeenCalledTimes(1);
});

test("re-adds listener on adapter when subscribing actor listener after disconnecting", () => {
  const adapter = createTestAdapter();
  const actor = createActor(adapter);

  const handleConnect = jest.fn();
  const unsubscribeConnect = actor.on("initializePanel", handleConnect);

  expect(adapter.addListener).toHaveBeenCalledTimes(1);

  unsubscribeConnect();
  expect(adapter.mocks.removeListener).toHaveBeenCalled();

  adapter.addListener.mockClear();

  actor.on("initializePanel", handleConnect);
  expect(adapter.addListener).toHaveBeenCalledTimes(1);
});
