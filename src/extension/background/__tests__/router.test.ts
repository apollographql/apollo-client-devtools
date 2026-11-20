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

const metadata: Omit<ApolloClientInfo, "id"> = {
  name: undefined,
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
  function client(name: string) {
    const transport = channel();
    const info = { ...metadata, name };
    const handle = createRpcHandler(transport.peer);
    const stopResponding = handle("getClientMetadata", () => info);
    const disconnect = router.connectClient(transport.router);
    disconnects.push(disconnect);
    return {
      ...transport,
      stopResponding,
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
    client,
    disconnectPanel,
    cleanup: () => disconnects.forEach((disconnect) => disconnect()),
  };
}

it("assigns IDs to client connections and sends inspection only to the owning client", async () => {
  const test = setup();
  try {
    const a = test.client("a");
    const b = test.client("b");
    a.handle("getCache", () => ({ secret: "a" }));
    b.handle("getCache", () => ({ secret: "b" }));
    const infos = await test.rpc.request("getClients");
    expect(new Set(infos.map(({ id }) => id)).size).toBe(2);
    const id = infos.find(({ name }) => name === "a")!.id;
    b.router.postMessage.mockClear();
    expect(await test.rpc.request("getCache", id)).toEqual({ secret: "a" });
    expect(b.router.postMessage).not.toHaveBeenCalled();
    await expect(test.rpc.request("getCache", "unknown")).rejects.toThrow(
      "Apollo Client is no longer connected"
    );

    b.actor.send({ type: "clientTerminated", clientId: id });
    expect(await test.rpc.request("getCache", id)).toEqual({ secret: "a" });
    expect(await test.rpc.request("getClient", id)).toMatchObject({
      id,
      name: "a",
    });
  } finally {
    test.cleanup();
  }
});

it("keeps frame control traffic separate from client discovery and operations", async () => {
  const test = setup();
  const control = channel();
  const disconnect = test.router.connectFrame(control.router);
  try {
    createActor(control.peer).send({
      type: "registerClient",
      payload: { ...metadata, id: "forged" },
    });
    await expect(
      createRpcClient(control.peer).request("getErrorCodes", "unknown-version")
    ).resolves.toBeUndefined();
    expect(await test.rpc.request("getClients")).toEqual([]);
    const a = test.client("a");
    a.handle("getCache", () => ({ secret: true }));
    const [info] = await test.rpc.request("getClients");
    control.router.postMessage.mockClear();
    expect(await test.rpc.request("getCache", info.id)).toEqual({
      secret: true,
    });
    expect(control.router.postMessage).not.toHaveBeenCalled();
  } finally {
    disconnect();
    test.cleanup();
  }
});

it("ignores client-supplied IDs and termination events until the port disconnects", async () => {
  const test = setup();
  const transport = channel();
  createRpcHandler(transport.peer)("getClientMetadata", () => ({
    ...metadata,
    name: "untrusted",
    id: "supplied-id",
  }));
  const disconnect = test.router.connectClient(transport.router);
  try {
    const sibling = test.client("sibling");
    sibling.handle("getCache", () => ({ alive: true }));
    const infos = await test.rpc.request("getClients");
    const untrusted = infos.find(({ name }) => name === "untrusted")!;
    const trusted = infos.find(({ name }) => name === "sibling")!;
    expect(untrusted.id).not.toBe("supplied-id");
    const stop = { type: "clientTerminated" as const, clientId: trusted.id };
    createActor(transport.peer).send(stop);
    expect(await test.rpc.request("getClients")).toEqual(infos);

    disconnect();
    expect(await test.rpc.request("getClients")).toEqual([
      expect.objectContaining({ id: trusted.id }),
    ]);
    expect(await test.rpc.request("getCache", trusted.id)).toEqual({
      alive: true,
    });
  } finally {
    disconnect();
    test.cleanup();
  }
});

it("targets Explorer requests and never forwards client-originated commands", async () => {
  const test = setup();
  try {
    const a = test.client("a");
    const b = test.client("b");
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

it("forwards cache streams and cancels only the owning client's stream", async () => {
  const test = setup();
  try {
    const a = test.client("a");
    const b = test.client("b");
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
      }),
      undefined
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
    const a = test.client("a");
    const b = test.client("b");
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

it("aborts pending work when a client disconnects and leaves its sibling connected", async () => {
  const test = setup();
  try {
    const a = test.client("a");
    const b = test.client("b");
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

it("cleans up client-side streams when the panel disconnects", async () => {
  const test = setup();
  try {
    const a = test.client("a");
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

it("keeps the last metadata when a connected client misses a refresh", async () => {
  const test = setup();
  try {
    const client = test.client("slow");
    const infos = await test.rpc.request("getClients");
    expect(infos).toHaveLength(1);
    client.stopResponding();
    expect(await test.rpc.request("getClients")).toEqual(infos);
    client.disconnect();
    expect(await test.rpc.request("getClients")).toEqual([]);
  } finally {
    test.cleanup();
  }
});

it("returns discoveries from responsive clients even when another client is silent", async () => {
  const test = setup();
  const silent = channel();
  const disconnect = test.router.connectClient(silent.router);
  try {
    test.client("responsive");
    expect(await test.rpc.request("getClients")).toEqual([
      expect.objectContaining({ name: "responsive" }),
    ]);
  } finally {
    disconnect();
    test.cleanup();
  }
});
