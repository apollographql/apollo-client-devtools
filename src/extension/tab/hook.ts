import type { ApolloClient as ApolloClient4 } from "@apollo/client";
import { Slot } from "@wry/context";

// All manifests should contain the same version number so it shouldn't matter
// which one we import from.
import * as manifest from "../chrome/manifest.json";
const { version: devtoolsVersion } = manifest;
import type { ApolloClient, ApolloClientInfo } from "@/types";
import { createActor } from "../actor";
import { createMessagePortMessageAdapter } from "../messageAdapters";
import {
  createTabMessagePort,
  createClientMessagePort,
} from "./controlChannel";
import {
  createRpcClient,
  createRpcHandler,
  createRpcStreamHandler,
} from "../rpc";
import { loadErrorCodes } from "./loadErrorCodes";
import { handleExplorerRequests } from "./handleExplorerRequests";
import type { ClientHandler, IDv3, IDv4 } from "./clientHandler";
import type { ClientV3Handler } from "./v3/handler";
import type { ClientV4Handler } from "./v4/handler";
import type { Cache } from "@/application/types/scalars";
import { createHandler } from "./helpers";
import { patch } from "@/application/utilities/patch";
import { gte } from "semver";

declare global {
  type TCache = any;

  interface Window {
    __APOLLO_CLIENT__?: ApolloClient;
    [DEVTOOLS_KEY]?: {
      push(client: ApolloClient): void;
    };
  }
}

type Hook = {
  version: string;
};

const DEVTOOLS_KEY = Symbol.for("apollo.devtools");

const tabPortAdapter = createMessagePortMessageAdapter(
  createTabMessagePort(window),
  { jsonSerialize: true }
);
const tab = createActor(tabPortAdapter);
const tabRpcClient = createRpcClient(tabPortAdapter);

const knownClients = new Set<ApolloClient>();
const handlers = new Map<ApolloClient, ClientHandler<ApolloClient>>();

Object.defineProperty(window, "__APOLLO_DEVTOOLS_GLOBAL_HOOK__", {
  get(): Hook {
    return { version: devtoolsVersion };
  },
  configurable: true,
});

function getClientInfo(client: ApolloClient): ApolloClientInfo {
  const handler = handlers.get(client)!;

  return {
    id: handler.id,
    name: "devtoolsConfig" in client ? client.devtoolsConfig.name : undefined,
    version: client.version,
    queryCount: handler.getQueries().length,
    mutationCount: handler.getMutations().length,
  };
}

function watchForClientTermination(client: ApolloClient) {
  const originalStop = client.stop;

  client.stop = () => {
    knownClients.delete(client);
    const handler = handlers.get(client);
    handlers.delete(client);

    if (window.__APOLLO_CLIENT__ === client) {
      window.__APOLLO_CLIENT__ = undefined;
    }
    if (handler) {
      tab.send({ type: "clientTerminated", clientId: handler.id });
    }
    originalStop.call(client);
  };
}

function isV4Client(client: ApolloClient): client is ApolloClient4 {
  return gte(client.version, "4.0.0");
}

function connectClient(client: ApolloClient) {
  const handler = handlers.get(client)!;
  const adapter = createMessagePortMessageAdapter(
    createClientMessagePort(window, handler.id),
    { jsonSerialize: true }
  );
  const actor = createActor(adapter);
  const handleRpc = createRpcHandler(adapter);
  const handleRpcStream = createRpcStreamHandler(adapter);

  // The background script loads error codes by listening for messages from the
  // tab port, so we need to use that instead of a client port
  loadErrorCodes(tabRpcClient, client.version);

  handleExplorerRequests(actor, handler);

  handleRpc("getClient", () => getClientInfo(client));
  handleRpc("getCache", () => client.cache.extract(true));

  handleRpc(
    isV4Client(client) ? "getV4MemoryInternals" : "getV3MemoryInternals",
    () => client.getMemoryInternals?.()
  );

  handleRpc(isV4Client(client) ? "getV4Queries" : "getV3Queries", () =>
    handler.getQueries()
  );
  handleRpc(isV4Client(client) ? "getV4Mutations" : "getV3Mutations", () =>
    handler.getMutations()
  );

  handleRpcStream("cacheWrite", ({ push, close }) => {
    const slot = new Slot<boolean>();
    // Both v3 and v4 have the same options/return value so we can treat the
    // client the same for both versions
    const { cache } = client as ApolloClient4;
    const revertPatches = new Set<() => void>();

    function run<TReturn>(fn: () => TReturn): {
      result: TReturn;
      timestamp: Date;
      cache: { before: Cache; after: Cache };
    } {
      const timestamp = new Date();
      const before = cache.extract(true) as Cache;
      const result = slot.withValue(true, fn);
      const after = cache.extract(true) as Cache;

      return { result, timestamp, cache: { before, after } };
    }

    revertPatches.add(
      patch(client, "stop", function (original, ...args) {
        close();
        return original.apply(this, args);
      })
    );

    revertPatches.add(
      patch(cache, "modify", function (originalModify, ...args) {
        const [options] = args;
        const { result, ...rest } = run(() => originalModify.apply(this, args));

        const fields =
          typeof options.fields === "function"
            ? options.fields.toString()
            : Object.fromEntries(
                Object.entries(options.fields).map(([key, modifier]) => {
                  return [key, modifier?.toString()];
                })
              );

        push({ type: "modify", options: { ...options, fields }, ...rest });

        return result;
      })
    );

    revertPatches.add(
      patch(cache, "write", function (originalWrite, ...args) {
        if (slot.getValue()) {
          return originalWrite.apply(this, args);
        }

        const { result, ...rest } = run(() => originalWrite.apply(this, args));

        push({ type: "write", options: args[0], ...rest });

        return result;
      })
    );

    revertPatches.add(
      patch(cache, "writeQuery", function (originalWriteQuery, ...args) {
        const { result, ...rest } = run(() =>
          originalWriteQuery.apply(this, args)
        );

        push({ type: "writeQuery", options: args[0], ...rest });

        return result;
      })
    );

    revertPatches.add(
      patch(cache, "writeFragment", function (originalWriteFragment, ...args) {
        const { result, ...rest } = run(() =>
          originalWriteFragment.apply(this, args)
        );

        push({ type: "writeFragment", options: args[0], ...rest });

        return result;
      })
    );

    return () => {
      revertPatches.forEach((revert) => revert());
    };
  });
}

function registerClient(client: ApolloClient) {
  if (!knownClients.has(client)) {
    knownClients.add(client);

    handlers.set(client, createHandler(client));
    watchForClientTermination(client);

    tab.send({ type: "registerClient", payload: getClientInfo(client) });

    connectClient(client);
  }

  // TODO: Repurpose this callback. The message it sent was not listened by
  // anything, so the broadcast was useless. Currently the devtools rely on
  // polling the client every second for updates, rather than relying on
  // this callback to update the devtools state.
  // client.__actionHookForDevTools(() => {
  //   if (client !== hook.ApolloClient) {
  //     // if the client has changed, don't send the action hook
  //     return;
  //   }
  // });
}

const preExisting = window[DEVTOOLS_KEY];
window[DEVTOOLS_KEY] = { push: registerClient };
if (Array.isArray(preExisting)) {
  (preExisting as Array<ApolloClient>).forEach(registerClient);
}

// Handles registering legacy clients (< v3.7) which do not use the new
// registration mechanism above.
let globalClient = window.__APOLLO_CLIENT__;
Object.defineProperty(window, "__APOLLO_CLIENT__", {
  get() {
    return globalClient;
  },
  set(client: ApolloClient | undefined) {
    if (client) {
      // We call this in a setTimeout because the client is not fully
      // instantiated before the property on window is assigned since it
      // connects from the constructor of ApolloClient. This allows
      // initialization to finish before we register it.
      setTimeout(() => registerClient(client));
    }

    globalClient = client;
  },
  configurable: true,
});

if (globalClient) {
  registerClient(globalClient);
}
