import type { ApolloClient as ApolloClient4 } from "@apollo/client";
import type { ApolloClient as ApolloClient3 } from "@apollo/client-3";
import { Slot } from "@wry/context";

// All manifests should contain the same version number so it shouldn't matter
// which one we import from.
import * as manifest from "../chrome/manifest.json";
const { version: devtoolsVersion } = manifest;
import type { ApolloClient, ApolloClientInfo } from "@/types";
import type { JSONObject } from "../../application/types/json";
import { createActor } from "../actor";
import {
  createMessagePortMessageAdapter,
  type MessageAdapter,
} from "../messageAdapters";
import { connectHook } from "./controlChannel";
import {
  createRpcClient,
  createRpcHandler,
  createRpcStreamHandler,
} from "../rpc";
import { loadErrorCodes } from "./loadErrorCodes";
import { handleExplorerRequests } from "./handleExplorerRequests";
import type { ClientHandler } from "./clientHandler";
import type { ClientV3Handler } from "./v3/handler";
import type { ClientV4Handler } from "./v4/handler";
import type { Cache } from "@/application/types/scalars";
import type { CacheWrite } from "./shared/types";
import { createHandler } from "./helpers";
import { patch } from "@/application/utilities/patch";

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

const messageAdapter = createMessagePortMessageAdapter(connectHook(window), {
  jsonSerialize: true,
});
const rpcClient = createRpcClient(messageAdapter);

const knownClients = new WeakSet<ApolloClient>();

Object.defineProperty(window, "__APOLLO_DEVTOOLS_GLOBAL_HOOK__", {
  get(): Hook {
    return { version: devtoolsVersion };
  },
  configurable: true,
});

function getClientInfo(
  handler: ClientHandler<ApolloClient>
): Omit<ApolloClientInfo, "id"> {
  const client = handler.getClient();

  return {
    name: "devtoolsConfig" in client ? client.devtoolsConfig.name : undefined,
    version: client.version,
    queryCount: handler.getQueries().length,
    mutationCount: handler.getMutations().length,
  };
}

function connectClient(
  handler: ClientHandler<ApolloClient>,
  adapter: MessageAdapter,
  signal: AbortSignal
) {
  const client = handler.getClient();
  const actor = createActor(adapter);
  const handleRpc = createRpcHandler(adapter);
  const handleRpcStream = createRpcStreamHandler(adapter);
  const options = { signal };

  // The port selects the client. Payload IDs never select another instance.
  handleRpc("getClientMetadata", () => getClientInfo(handler), options);
  handleRpc(
    "getV3Queries",
    () => (handler as ClientV3Handler).getQueries(),
    options
  );
  handleRpc(
    "getV4Queries",
    () => (handler as ClientV4Handler).getQueries(),
    options
  );
  handleRpc(
    "getV3Mutations",
    () => (handler as ClientV3Handler).getMutations(),
    options
  );
  handleRpc(
    "getV4Mutations",
    () => (handler as ClientV4Handler).getMutations(),
    options
  );
  handleRpc(
    "getCache",
    () => client.cache.extract(true) as JSONObject,
    options
  );
  handleRpc(
    "getV3MemoryInternals",
    () => (client as ApolloClient3<any>).getMemoryInternals?.(),
    options
  );
  handleRpc(
    "getV4MemoryInternals",
    () => (client as ApolloClient4).getMemoryInternals?.(),
    options
  );

  handleRpcStream(
    "cacheWrite",
    ({ push }) => observeCacheWrites(client, push),
    options
  );
  handleExplorerRequests(actor, () => handler, options);
  actor.send({ type: "clientReady" });
  return actor;
}

function observeCacheWrites(
  client: ApolloClient,
  push: (value: CacheWrite) => void
) {
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
}

function watchForClientTermination(client: ApolloClient, onStop: () => void) {
  const originalStop = client.stop;
  client.stop = () => {
    if (knownClients.delete(client)) {
      onStop();
      if (window.__APOLLO_CLIENT__ === client)
        window.__APOLLO_CLIENT__ = undefined;
    }
    originalStop.call(client);
  };
}

function registerClient(client: ApolloClient) {
  if (!knownClients.has(client)) {
    knownClients.add(client);

    const handler = createHandler(client);
    const abort = new AbortController();
    watchForClientTermination(client, () => abort.abort());
    async function connect() {
      const port = await rpcClient
        .withTimeout(Infinity)
        .withSignal(abort.signal)
        .request("connectClient");
      const adapter = createMessagePortMessageAdapter(port, {
        jsonSerialize: true,
      });
      if (abort.signal.aborted) {
        adapter.close();
        return;
      }
      const actor = connectClient(handler, adapter, abort.signal);
      abort.signal.addEventListener(
        "abort",
        () => {
          actor.send({ type: "disconnectClient" });
          adapter.close();
        },
        { once: true }
      );
    }
    void connect().catch((error) => {
      if (!abort.signal.aborted) {
        knownClients.delete(client);
        abort.abort();
        console.warn("Apollo DevTools could not connect to the client", error);
      }
    });
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
