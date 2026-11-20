import { runInThisContext } from "node:vm";
import { ApolloClient, ApolloLink, InMemoryCache, gql } from "@apollo/client";
import { waitFor } from "@testing-library/react";
import type browser from "webextension-polyfill";

jest.mock("webextension-polyfill", () => ({ runtime: { connect: jest.fn() } }));
jest.mock("../../../../all-clients/restore-errorcodes.mjs", () => ({
  restoreErrorCodes: jest.fn(() => ({})),
}));

function runtimePair(name: string) {
  const received = [
    new Set<(message: unknown) => void>(),
    new Set<(message: unknown) => void>(),
  ];
  const disconnected = [new Set<() => void>(), new Set<() => void>()];
  let closed = false;
  const ports = [0, 1].map((side) => ({
    name,
    sender: { tab: { id: 42 }, frameId: 0 },
    onMessage: {
      addListener: (listener: (message: unknown) => void) =>
        received[side].add(listener),
      removeListener: (listener: (message: unknown) => void) =>
        received[side].delete(listener),
    },
    onDisconnect: {
      addListener: (listener: () => void) => disconnected[side].add(listener),
      removeListener: (listener: () => void) =>
        disconnected[side].delete(listener),
    },
    postMessage: jest.fn((message: unknown) => {
      if (closed) throw new Error("Disconnected port");
      const data = JSON.parse(JSON.stringify(message));
      queueMicrotask(() => {
        if (!closed) received[1 - side].forEach((listener) => listener(data));
      });
    }),
    disconnect: jest.fn(() => {
      if (closed) return;
      closed = true;
      disconnected[1 - side].forEach((listener) => listener());
    }),
  }));
  return {
    local: ports[0],
    remote: ports[1],
    drop() {
      if (closed) return;
      closed = true;
      disconnected[1].forEach((listener) => listener());
      disconnected[0].forEach((listener) => listener());
    },
  };
}

it("bridges a frame and its clients 1:1, binds requests to ports, and cleans up independently", async () => {
  // Real Node MessagePorts deliver Node MessageEvents. The adapter captures the
  // native data getter, so use that constructor while loading these modules.
  const DOMMessageEvent = window.MessageEvent;
  const eventDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "MessageEvent"
  )!;
  Object.defineProperty(globalThis, "MessageEvent", {
    configurable: true,
    value: runInThisContext("MessageEvent"),
  });
  const bootstrap = jest
    .spyOn(window, "postMessage")
    .mockImplementation(
      (
        data: unknown,
        _origin?: string | WindowPostMessageOptions,
        transfer?: Transferable[]
      ) => {
        queueMicrotask(() =>
          window.dispatchEvent(
            new DOMMessageEvent("message", {
              data,
              source: window,
              ports: transfer as MessagePort[],
            })
          )
        );
      }
    );
  const pairs: ReturnType<typeof runtimePair>[] = [];
  const clients: ApolloClient[] = [];
  const hookWindow = window as unknown as Window & {
    [key: symbol]: { push(client: ApolloClient): void } | undefined;
  };
  const originalHook = hookWindow[Symbol.for("apollo.devtools")];
  const originalGlobalClient = Object.getOwnPropertyDescriptor(
    window,
    "__APOLLO_CLIENT__"
  );
  const originalLegacyHook = Object.getOwnPropertyDescriptor(
    window,
    "__APOLLO_DEVTOOLS_GLOBAL_HOOK__"
  );
  try {
    await jest.isolateModulesAsync(async () => {
      const { default: extension } = await import("webextension-polyfill");
      const { createBackgroundRouter } = await import(
        "../../background/router"
      );
      const { createExternalPortMessageAdapter } = await import(
        "../../messageAdapters"
      );
      const { createRpcClient } = await import("../../rpc");
      const router = createBackgroundRouter();
      jest.mocked(extension.runtime.connect).mockImplementation((options) => {
        const pair = runtimePair(options!.name!);
        pairs.push(pair);
        queueMicrotask(() =>
          router.onConnect(pair.remote as unknown as browser.Runtime.Port)
        );
        return pair.local as unknown as browser.Runtime.Port;
      });
      await import("../tab");
      await import("../hook");
      const panel = extension.runtime.connect({ name: "42" });
      const rpc = createRpcClient(
        createExternalPortMessageAdapter(panel)
      ).withTimeout(2000);
      const query = gql`
        query Secret {
          secret
        }
      `;
      for (const name of ["a", "b"]) {
        const client = new ApolloClient({
          cache: new InMemoryCache(),
          link: ApolloLink.empty(),
          devtools: { enabled: false, name },
        });
        client.writeQuery({ query, data: { secret: name } });
        clients.push(client);
        // Let the usual RPC deadline pass before the real MessagePort can deliver.
        jest.useFakeTimers({ doNotFake: ["queueMicrotask"] });
        try {
          hookWindow[Symbol.for("apollo.devtools")]!.push(client);
          jest.advanceTimersByTime(31_000);
        } finally {
          jest.useRealTimers();
        }
      }
      await waitFor(() =>
        expect(
          pairs.filter(({ local }) => local.name === "client")
        ).toHaveLength(2)
      );
      const infos = await rpc.request("getClients");
      expect(infos.map(({ name }) => name).sort()).toEqual(["a", "b"]);
      expect(new Set(infos.map(({ id }) => id)).size).toBe(2);
      expect(bootstrap).toHaveBeenCalledTimes(1);
      const frames = pairs.filter(({ local }) => local.name === "tab");
      expect(frames).toHaveLength(1);
      expect(frames[0].local.postMessage).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: "rpcRequest",
          name: "connectClient",
        })
      );
      const a = infos.find(({ name }) => name === "a")!;
      const b = infos.find(({ name }) => name === "b")!;
      const clientPairs = pairs.filter(({ local }) => local.name === "client");
      expect(await rpc.request("getCache", a.id)).toMatchObject({
        ROOT_QUERY: { secret: "a" },
      });
      const aPair = clientPairs.find(({ remote }) =>
        remote.postMessage.mock.calls.some(
          ([message]) => (message as { name?: string }).name === "getCache"
        )
      )!;
      // Even a payload naming the sibling cannot change the client bound to a port.
      const messages: unknown[] = [];
      aPair.remote.onMessage.addListener((message) => messages.push(message));
      aPair.remote.postMessage({
        source: "apollo-client-devtools",
        type: "rpcRequest",
        id: "bound-port",
        name: "getCache",
        params: [b.id],
      });
      await waitFor(() =>
        expect(messages).toContainEqual(
          expect.objectContaining({
            sourceId: "bound-port",
            result: expect.objectContaining({
              ROOT_QUERY: expect.objectContaining({ secret: "a" }),
            }),
          })
        )
      );
      const clientRpc = createRpcClient(
        createExternalPortMessageAdapter(
          aPair.remote as unknown as browser.Runtime.Port
        )
      );
      const metadata = await clientRpc.request("getClientMetadata");
      expect(metadata.name).toBe("a");
      expect(metadata).not.toHaveProperty("id");
      const originalWrite = clients[0].cache.write;
      const reader = rpc.stream("cacheWrite", a.id).getReader();
      await waitFor(() =>
        expect(clients[0].cache.write).not.toBe(originalWrite)
      );
      aPair.drop();
      await waitFor(() =>
        expect(
          pairs.filter(({ local }) => local.name === "client")
        ).toHaveLength(3)
      );
      await waitFor(() => expect(clients[0].cache.write).toBe(originalWrite));
      await reader.cancel();
      const reconnected = await rpc.request("getClients");
      expect(reconnected.find(({ name }) => name === "b")!.id).toBe(b.id);
      const reconnectedA = reconnected.find(({ name }) => name === "a")!;
      const activeReader = rpc
        .stream("cacheWrite", reconnectedA.id)
        .getReader();
      await waitFor(() =>
        expect(clients[0].cache.write).not.toBe(originalWrite)
      );
      clients[0].stop();
      expect(clients[0].cache.write).toBe(originalWrite);
      await expect(activeReader.read()).resolves.toMatchObject({ done: true });
      await waitFor(async () =>
        expect((await rpc.request("getClients")).map(({ id }) => id)).toEqual([
          b.id,
        ])
      );
      expect(await rpc.request("getCache", b.id)).toMatchObject({
        ROOT_QUERY: { secret: "b" },
      });
      for (const { local } of pairs.filter(
        ({ local }) => local.name === "client"
      )) {
        expect(local.postMessage).not.toHaveBeenCalledWith(
          expect.objectContaining({
            type: "actor",
            message: { type: "disconnectClient" },
          })
        );
      }
      expect(pairs.filter(({ local }) => local.name === "client")).toHaveLength(
        3
      );

      const stopped = new ApolloClient({
        cache: new InMemoryCache(),
        link: ApolloLink.empty(),
        devtools: { enabled: false },
      });
      hookWindow[Symbol.for("apollo.devtools")]!.push(stopped);
      stopped.stop(); // The isolated script has not delivered its port yet.
      const next = new ApolloClient({
        cache: new InMemoryCache(),
        link: ApolloLink.empty(),
        devtools: { enabled: false, name: "next" },
      });
      clients.push(next);
      hookWindow[Symbol.for("apollo.devtools")]!.push(next);
      await waitFor(async () =>
        expect(
          (await rpc.request("getClients")).map(({ name }) => name).sort()
        ).toEqual(["b", "next"])
      );
      expect(pairs.filter(({ local }) => local.name === "client")).toHaveLength(
        4
      );
    });
  } finally {
    clients.forEach((client) => client.stop());
    pairs.forEach(({ local }) => local.disconnect());
    bootstrap.mockRestore();
    Object.defineProperty(globalThis, "MessageEvent", eventDescriptor);
    hookWindow[Symbol.for("apollo.devtools")] = originalHook;
    for (const [key, descriptor] of [
      ["__APOLLO_CLIENT__", originalGlobalClient],
      ["__APOLLO_DEVTOOLS_GLOBAL_HOOK__", originalLegacyHook],
    ] as const) {
      if (descriptor) Object.defineProperty(window, key, descriptor);
      else Reflect.deleteProperty(window, key);
    }
  }
}, 30_000);
