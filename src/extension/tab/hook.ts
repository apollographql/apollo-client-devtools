import type { ApolloClient as ApolloClient4 } from "@apollo/client";
import type { ApolloClient as ApolloClient3 } from "@apollo/client-3";
import { Slot } from "@wry/context";

// All manifests should contain the same version number so it shouldn't matter
// which one we import from.
import * as manifest from "../chrome/manifest.json";
const { version: devtoolsVersion } = manifest;
import type { ApolloClient, ApolloClientInfo } from "@/types";
import type { JSONObject } from "../../application/types/json";
import { createWindowActor } from "../actor";
import { createWindowMessageAdapter } from "../messageAdapters";
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

const tab = createWindowActor(window);
const messageAdapter = createWindowMessageAdapter(window, {
  jsonSerialize: true,
});
const handleRpc = createRpcHandler(messageAdapter);
const handleRpcStream = createRpcStreamHandler(messageAdapter);
const rpcClient = createRpcClient(messageAdapter);

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

handleRpc("getClients", () => {
  return Array.from(knownClients).map(getClientInfo);
});

handleRpc("getClient", (clientId) => {
  const client = getClientById(clientId);

  return client ? getClientInfo(client) : null;
});

handleRpc(
  "getV3Queries",
  (clientId) => getHandlerByClientId(clientId)?.getQueries() ?? []
);

handleRpc(
  "getV4Queries",
  (clientId) => getHandlerByClientId(clientId)?.getQueries() ?? []
);

handleRpc(
  "getV3Mutations",
  (clientId) => getHandlerByClientId(clientId)?.getMutations() ?? []
);

handleRpc(
  "getV4Mutations",
  (clientId) => getHandlerByClientId(clientId)?.getMutations() ?? []
);

handleRpc("getCache", (clientId) => {
  return (getClientById(clientId)?.cache.extract(true) as JSONObject) ?? {};
});

handleRpc("getV3MemoryInternals", (clientId) => {
  return getClientById(clientId)?.getMemoryInternals?.();
});

handleRpc("getV4MemoryInternals", (clientId) => {
  return getClientById(clientId)?.getMemoryInternals?.();
});

handleRpcStream("cacheWrite", ({ push, close }, clientId) => {
  const slot = new Slot<boolean>();
  // Both v3 and v4 have the same options/return value so we can treat the
  // client the same for both versions
  const client = getClientById(clientId) as ApolloClient4;

  const { cache } = client;
  const originalWrite = cache.write;
  const originalWriteQuery = cache.writeQuery;
  const originalWriteFragment = cache.writeFragment;
  const originalModify = cache.modify;
  const originalStop = client.stop;

  // Track when we revert the monkey patch back to the original function in case
  // other extensions/code adds additional monkey patches on top of this which
  // might accidentally restore these monkey patched funtions. If the patch is
  // reverted but the monkey patched functions run, we can short circuit and
  // just call the original.
  let reverted = false;

  client.stop = function (...args: Parameters<typeof originalStop>) {
    if (reverted) {
      return originalStop.apply(this, args);
    }

    close();
    return originalStop.apply(this, args);
  };

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

  cache.modify = function (
    this: ThisType<typeof originalModify>,
    ...args: Parameters<typeof originalModify>
  ) {
    if (reverted) {
      return originalModify.apply(this, args);
    }

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
  } as typeof originalModify;

  cache.write = function (...args: Parameters<typeof originalWrite>) {
    if (reverted || slot.getValue()) {
      return originalWrite.apply(this, args);
    }

    const { result, ...rest } = run(() => originalWrite.apply(this, args));

    push({ type: "write", options: args[0], ...rest });

    return result;
  };

  cache.writeQuery = function (...args: Parameters<typeof originalWriteQuery>) {
    if (reverted) {
      return originalWriteQuery.apply(this, args);
    }

    const { result, ...rest } = run(() => originalWriteQuery.apply(this, args));

    push({ type: "writeQuery", options: args[0], ...rest });

    return result;
  };

  cache.writeFragment = function (
    ...args: Parameters<typeof originalWriteFragment>
  ) {
    if (reverted) {
      return originalWriteFragment.apply(this, args);
    }

    const { result, ...rest } = run(() =>
      originalWriteFragment.apply(this, args)
    );

    push({ type: "writeFragment", options: args[0], ...rest });

    return result;
  };

  return () => {
    client.stop = originalStop;
    cache.write = originalWrite;
    cache.writeFragment = originalWriteFragment;
    cache.writeQuery = originalWriteQuery;
    cache.modify = originalModify;
    reverted = true;
  };
});

function getClientById(clientId: IDv3): ApolloClient3<any>;
function getClientById(clientId: IDv4): ApolloClient4;
function getClientById(
  clientId: IDv3 | IDv4
): ApolloClient3<any> | ApolloClient4;

function getClientById(clientId: IDv3 | IDv4): ApolloClient | undefined {
  return getHandlerByClientId(clientId as any)?.getClient();
}

function getHandlerByClientId(clientId: IDv3): ClientV3Handler | undefined;
function getHandlerByClientId(clientId: IDv4): ClientV4Handler | undefined;

function getHandlerByClientId(clientId: IDv3 | IDv4) {
  return [...handlers.values()].find((handler) => handler.id === clientId);
}

handleExplorerRequests(tab, getHandlerByClientId);

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

function registerClient(client: ApolloClient) {
  if (!knownClients.has(client)) {
    knownClients.add(client);

    handlers.set(client, createHandler(client));
    watchForClientTermination(client);

    tab.send({ type: "registerClient", payload: getClientInfo(client) });
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

  loadErrorCodes(rpcClient, client.version);
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
