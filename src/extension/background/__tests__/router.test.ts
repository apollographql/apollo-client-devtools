import { waitFor } from "@testing-library/react";
import { gql } from "@apollo/client";
import type { ApolloClientInfo } from "@/types";
import { createActor } from "../../actor";
import { MessageAdapter } from "../../messageAdapters";
import { createDevtoolsMessage, MessageType } from "../../messages";
import {
  createRpcClient,
  createRpcHandler,
  createRpcStreamHandler,
} from "../../rpc";
import { createTabRouter } from "../router";

jest.mock("../../../../all-clients/restore-errorcodes.mjs", () => ({
  restoreErrorCodes: jest.fn(() => ({})),
}));

function channel() {
  const left = new Set<(message: unknown) => void>();
  const right = new Set<(message: unknown) => void>();
  function adapter(listeners: typeof left, receivers: typeof left) {
    const transport = new MessageAdapter({
      addListener(listener: (message: unknown) => void) {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
      postMessage: jest.fn((message) => {
        queueMicrotask(() => receivers.forEach((receive) => receive(message)));
      }),
    });
    return Object.assign(transport, {
      postMessage: jest.spyOn(transport, "postMessage"),
    });
  }
  return { router: adapter(left, right), peer: adapter(right, left) };
}

const metadata: ApolloClientInfo = {
  name: undefined,
  id: "client-id",
  version: "4.0.9",
  queryCount: 0,
  mutationCount: 0,
};

function setup() {
  const router = createTabRouter();
  const panel = channel();
  const disconnectPanel = router.connectPanel(panel.router);
  const rpc = createRpcClient(panel.peer);
  const actor = createActor(panel.peer);
  const disconnects = [disconnectPanel];
  function frame(name: string) {
    const transport = channel();
    const info = { ...metadata, id: name, name };
    const handle = createRpcHandler(transport.peer);
    handle("getClients", () => [info]);
    handle("getClient", () => info);
    const disconnect = router.connectFrame(transport.router);
    disconnects.push(disconnect);
    return {
      ...transport,
      handle,
      actor: createActor(transport.peer),
      disconnect,
    };
  }
  return {
    router,
    panel,
    rpc,
    actor,
    frame,
    disconnectPanel,
    cleanup: () => disconnects.forEach((disconnect) => disconnect()),
  };
}

it("preserves upstream client IDs and sends inspection only to the owning frame", async () => {
  const test = setup();
  try {
    const a = test.frame("a");
    const b = test.frame("b");
    a.handle("getCache", () => ({ secret: "a" }));
    b.handle("getCache", () => ({ secret: "b" }));
    const infos = await test.rpc.request("getClients");
    expect(infos.map(({ id }) => id).sort()).toEqual(["a", "b"]);
    const id = infos.find(({ name }) => name === "a")!.id;
    b.router.postMessage.mockClear();
    expect(await test.rpc.request("getCache", id)).toEqual({ secret: "a" });
    expect(b.router.postMessage).not.toHaveBeenCalled();

    b.actor.send({ type: "clientTerminated", clientId: id });
    expect(await test.rpc.request("getCache", id)).toEqual({ secret: "a" });
    expect(await test.rpc.request("getClient", id)).toMatchObject({
      id,
      name: "a",
    });
    await expect(test.rpc.request("getCache", "unknown")).rejects.toThrow(
      "no longer connected"
    );
  } finally {
    test.cleanup();
  }
});

it("targets Explorer requests and never forwards frame-originated commands", async () => {
  const test = setup();
  try {
    const a = test.frame("a");
    const b = test.frame("b");
    const infos = await test.rpc.request("getClients");
    const id = infos.find(({ name }) => name === "a")!.id;
    const requests = jest.fn();
    const responses = jest.fn();
    a.actor.on("explorerRequest", requests);
    test.actor.on("explorerResponse", responses);
    a.router.postMessage.mockClear();
    b.router.postMessage.mockClear();
    const payload = {
      clientId: id,
      operation: gql`
        query Secret {
          secret
        }
      `,
      operationName: "Secret",
      variables: undefined,
      fetchPolicy: "no-cache" as const,
    };
    b.actor.send({ type: "explorerRequest", payload });
    b.peer.postMessage(
      createDevtoolsMessage({
        type: MessageType.RPCRequest,
        id: "forged-request",
        name: "getCache",
        params: [id],
      })
    );
    test.actor.send({ type: "explorerRequest", payload });
    await waitFor(() => expect(requests).toHaveBeenCalledTimes(1));
    expect(a.router.postMessage).toHaveBeenCalledTimes(1);
    expect(requests.mock.calls[0][0].payload.clientId).toBe(id);
    a.actor.send({
      type: "explorerResponse",
      payload: {
        operationName: "Secret",
        response: { data: { secret: "real" } },
      },
    });
    await waitFor(() => expect(responses).toHaveBeenCalledTimes(1));
    expect(b.router.postMessage).not.toHaveBeenCalled();
  } finally {
    test.cleanup();
  }
});

it("forwards cache streams and cancels only the owning frame's stream", async () => {
  const test = setup();
  try {
    const a = test.frame("a");
    const b = test.frame("b");
    const cancelled = jest.fn();
    let push!: (value: never) => void;
    createRpcStreamHandler(a.peer)("cacheWrite", (controller) => {
      push = controller.push;
      return cancelled;
    });
    const infos = await test.rpc.request("getClients");
    const id = infos.find(({ name }) => name === "a")!.id;
    b.router.postMessage.mockClear();
    const reader = test.rpc.stream("cacheWrite", id).getReader();
    await waitFor(() => expect(push).toBeDefined());
    const start = a.router.postMessage.mock.calls
      .map(([message]) => message)
      .find((message) => message.type === MessageType.RPCStartStream)!;
    if (start.type !== MessageType.RPCStartStream)
      throw new Error("Missing stream start");
    expect(test.panel.peer.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: MessageType.RPCStartStream,
        id: start.id,
      })
    );
    b.peer.postMessage({
      type: MessageType.RPCStreamChunk,
      streamId: start.id,
      value: { secret: "forged" },
    });
    // The router transports cache-write payloads without inspecting their data.
    push({ secret: "cache contents" } as never);
    expect(await reader.read()).toEqual({
      done: false,
      value: { secret: "cache contents" },
    });
    await reader.cancel();
    await waitFor(() => expect(cancelled).toHaveBeenCalledTimes(1));
    expect(b.router.postMessage).not.toHaveBeenCalled();
  } finally {
    test.cleanup();
  }
});

it("forwards requests without method-specific handlers and rejects sibling replies", async () => {
  const test = setup();
  try {
    const a = test.frame("a");
    const b = test.frame("b");
    const infos = await test.rpc.request("getClients");
    const id = infos.find(({ name }) => name === "a")!.id;
    a.router.postMessage.mockClear();
    const responses = jest.fn();
    const remove = test.panel.peer.on(MessageType.RPCResponse, responses);
    test.panel.peer.postMessage({
      type: MessageType.RPCRequest,
      id: "panel-request",
      name: "futureInspectionMethod",
      params: [id, { option: true }],
    });
    await waitFor(() => expect(a.router.postMessage).toHaveBeenCalledTimes(1));
    const request = a.router.postMessage.mock.calls[0][0];
    if (request.type !== MessageType.RPCRequest)
      throw new Error("Missing request");
    expect(request).toMatchObject({
      id: "panel-request",
      name: "futureInspectionMethod",
      params: [id, { option: true }],
    });
    b.peer.postMessage({
      type: MessageType.RPCResponse,
      sourceId: request.id,
      result: "forged",
    });
    a.peer.postMessage({
      type: MessageType.RPCResponse,
      sourceId: request.id,
      result: "real",
    });
    await waitFor(() => expect(responses).toHaveBeenCalledTimes(1));
    expect(responses.mock.calls[0][0]).toMatchObject({
      sourceId: "panel-request",
      result: "real",
    });
    remove();
  } finally {
    test.cleanup();
  }
});

it("aborts pending work when a frame disconnects and leaves its sibling connected", async () => {
  const test = setup();
  try {
    const a = test.frame("a");
    const b = test.frame("b");
    const pending = jest.fn(() => new Promise<Record<string, never>>(() => {}));
    a.handle("getCache", pending);
    b.handle("getCache", () => ({ sibling: true }));
    const infos = await test.rpc.request("getClients");
    const result = test.rpc.request(
      "getCache",
      infos.find(({ name }) => name === "a")!.id
    );
    const rejected = expect(result).rejects.toThrow();
    await waitFor(() => expect(pending).toHaveBeenCalledTimes(1));
    a.disconnect();
    await rejected;
    expect(
      await test.rpc.request(
        "getCache",
        infos.find(({ name }) => name === "b")!.id
      )
    ).toEqual({ sibling: true });
  } finally {
    test.cleanup();
  }
});

it("cleans up frame-side streams when the panel disconnects", async () => {
  const test = setup();
  try {
    const a = test.frame("a");
    const cancelled = jest.fn();
    const started = jest.fn(() => cancelled);
    createRpcStreamHandler(a.peer)("cacheWrite", started);
    const [info] = await test.rpc.request("getClients");
    const reader = test.rpc.stream("cacheWrite", info.id).getReader();
    await waitFor(() => expect(started).toHaveBeenCalledTimes(1));
    test.disconnectPanel();
    await waitFor(() => expect(cancelled).toHaveBeenCalledTimes(1));
    await reader.cancel();
  } finally {
    test.cleanup();
  }
});

it("returns discoveries from responsive frames even when another frame is silent", async () => {
  const test = setup();
  const silent = channel();
  const disconnect = test.router.connectFrame(silent.router);
  try {
    test.frame("responsive");
    expect(await test.rpc.request("getClients")).toEqual([
      expect.objectContaining({ name: "responsive" }),
    ]);
  } finally {
    disconnect();
    test.cleanup();
  }
});
