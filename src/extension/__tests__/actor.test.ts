import { createTestSource } from "@/testUtils/createTestSource";
import { Actor, createActor } from "../actor";
import { MessageAdapter } from "../messageAdapters";
import { MessageType } from "../messages";

test("filters named actor messages", () => {
  const include = Actor.createFilter({ includeTypes: ["clientReady"] });
  const exclude = Actor.createFilter({ excludeTypes: ["clientReady"] });
  const ready = {
    type: MessageType.Actor,
    message: { type: "clientReady" },
  } as const;
  const reply = {
    type: MessageType.RPCResponse,
    sourceId: "1",
    result: null,
  } as const;
  expect(include(ready)).toBe(true);
  expect(exclude(ready)).toBe(false);
  expect(include(reply)).toBe(false);
  expect(exclude(reply)).toBe(true);
});

test("sends messages to specified adapter in devtools message format", () => {
  const source = createTestSource();
  const actor = createActor(new MessageAdapter(source));

  actor.send({ type: "clientTerminated", clientId: "1" });

  expect(source.mocks.messages[0]).toEqual({
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
  const source = createTestSource();
  const actor = createActor(new MessageAdapter(source));

  const handleConnect = jest.fn();
  const handleDisconnect = jest.fn();

  actor.on("initializePanel", handleConnect);
  actor.on("clientTerminated", handleDisconnect);

  source.simulateActorMessage({ type: "initializePanel", initialContext: {} });

  expect(handleConnect).toHaveBeenCalledTimes(1);
  expect(handleConnect).toHaveBeenCalledWith({
    type: "initializePanel",
    initialContext: {},
  });
  expect(handleDisconnect).not.toHaveBeenCalled();

  source.simulateActorMessage({ type: "clientTerminated", clientId: "1" });
  source.simulateActorMessage({ type: "clientTerminated", clientId: "2" });

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
  const source = createTestSource();
  const actor = createActor(new MessageAdapter(source));

  const handleMessage = jest.fn();
  const handleMessage2 = jest.fn();
  const handleMessage3 = jest.fn();

  actor.on("initializePanel", handleMessage);
  actor.on("initializePanel", handleMessage2);
  actor.on("initializePanel", handleMessage3);

  source.simulateActorMessage({ type: "initializePanel", initialContext: {} });

  expect(handleMessage).toHaveBeenCalledTimes(1);
  expect(handleMessage2).toHaveBeenCalledTimes(1);
  expect(handleMessage3).toHaveBeenCalledTimes(1);
});

test("ignores messages that don't originate from devtools", () => {
  const source = createTestSource();
  const actor = createActor(new MessageAdapter(source));

  const handleMessage = jest.fn();
  actor.on("initializePanel", handleMessage);

  source.simulatePlainMessage({ type: "initializePanel" });

  expect(handleMessage).not.toHaveBeenCalled();
});

test.each([MessageType.RPCRequest, MessageType.RPCResponse])(
  "ignores messages that are %s messages",
  (messageType) => {
    const source = createTestSource();
    const actor = createActor(new MessageAdapter(source));

    const handleMessage = jest.fn();
    actor.on("initializePanel", handleMessage);

    source.simulatePlainMessage({
      source: "apollo-client-devtools",
      type: messageType,
      message: { type: "initializePanel" },
    });

    expect(handleMessage).not.toHaveBeenCalled();
  }
);

test("does not add listener to adapter until first subscribed actor listener", () => {
  const source = createTestSource();
  const actor = createActor(new MessageAdapter(source));

  expect(source.addListener).not.toHaveBeenCalled();

  actor.send({ type: "initializePanel", initialContext: {} });
  expect(source.addListener).not.toHaveBeenCalled();

  actor.on("initializePanel", () => {});
  expect(source.addListener).toHaveBeenCalledTimes(1);
});

test("can unsubscribe from a message by calling the returned function", () => {
  const source = createTestSource();
  const actor = createActor(new MessageAdapter(source));

  const handleMessage = jest.fn();
  const unsubscribe = actor.on("initializePanel", handleMessage);

  source.simulateActorMessage({ type: "initializePanel", initialContext: {} });

  expect(handleMessage).toHaveBeenCalledTimes(1);

  handleMessage.mockClear();
  unsubscribe();

  source.simulateActorMessage({ type: "initializePanel", initialContext: {} });

  expect(handleMessage).not.toHaveBeenCalled();
});

test("removes listener on adapter when unsubscribing from last actor listener", () => {
  const source = createTestSource();
  const actor = createActor(new MessageAdapter(source));

  const handleConnect = jest.fn();
  const handleDisconnect = jest.fn();
  const unsubscribeConnect = actor.on("initializePanel", handleConnect);
  const unsubscribeDisconnect = actor.on("clientTerminated", handleDisconnect);

  unsubscribeConnect();

  expect(source.mocks.removeListener).not.toHaveBeenCalled();

  unsubscribeDisconnect();

  expect(source.mocks.removeListener).toHaveBeenCalledTimes(1);
});

test("re-adds listener on adapter when subscribing actor listener after disconnecting", () => {
  const source = createTestSource();
  const actor = createActor(new MessageAdapter(source));

  const handleConnect = jest.fn();
  const unsubscribeConnect = actor.on("initializePanel", handleConnect);

  expect(source.addListener).toHaveBeenCalledTimes(1);

  unsubscribeConnect();
  expect(source.mocks.removeListener).toHaveBeenCalled();

  source.addListener.mockClear();

  actor.on("initializePanel", handleConnect);
  expect(source.addListener).toHaveBeenCalledTimes(1);
});
