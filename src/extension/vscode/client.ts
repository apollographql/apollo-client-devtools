/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApolloClient } from "@apollo/client";
import { getPrivateAccess } from "../../privateAccess";
import { createActor } from "../actor";
import { createRpcClient, createRpcHandler } from "../rpc";
import { getQueries, getMutations } from "../tab/helpers";
import { loadErrorCodes } from "../tab/loadErrorCodes";
import type { MessageAdapter } from "../messageAdapters";
import { handleExplorerRequests } from "../tab/handleExplorerRequests";
import { setMaxListeners, WeakRef, FinalizationRegistry } from "./polyfills";

export function registerClient(
  client: ApolloClient<any>,
  url: string | URL
): {
  connected: Promise<void>;
  unregister: () => void;
  onCleanup: (cleanup: () => void) => void;
} {
  const clientRef = new WeakRef(client);
  const registered = _registerClient(clientRef, url);
  const registry = new FinalizationRegistry(registered.unregister);
  const unregisterToken = {};
  registry.register(client, "", unregisterToken);
  registered.onCleanup(() => registry.unregister(unregisterToken));
  return registered;
}

export function _registerClient(
  clientRef: WeakRef<ApolloClient<any>>,
  url: string | URL
): {
  connected: Promise<void>;
  unregister: () => void;
  onCleanup: (cleanup: () => void) => void;
} {
  const { signal, cleanup, registerCleanup } = getCleanupController();

  function getClient() {
    const client = clientRef.deref();
    if (client) {
      return getPrivateAccess(client);
    } else {
      cleanup();
    }
  }

  const ws = new WebSocket(url);
  registerCleanup(ws.close.bind(ws));
  ws.addEventListener("close", cleanup, { once: true, signal });

  const wsAdapter = createWsAdapter(ws, signal);
  const wsRpcClient = createRpcClient(wsAdapter);
  const wsRpcHandler = createRpcHandler(wsAdapter);
  const wsActor = createActor(wsAdapter);
  function getQueriesForClient() {
    return getQueries(
      getClient()?.queryManager.getObservableQueries("active") ?? new Map()
    );
  }
  function getMutationsForClient() {
    return getMutations(getClient()?.queryManager.mutationStore ?? {});
  }
  registerCleanup(
    wsRpcHandler("getQueries", getQueriesForClient),
    wsRpcHandler("getMutations", getMutationsForClient),
    wsRpcHandler("getCache", () => getClient()?.cache.extract(true) ?? {}),
    handleExplorerRequests(wsActor, getClient)
  );

  ws.addEventListener(
    "open",
    function open() {
      const client = getClient();
      if (!client) {
        return;
      }
      wsActor.send({
        type: "registerClient",
        payload: {
          id: "",
          name:
            "devtoolsConfig" in client ? client.devtoolsConfig.name : undefined,
          version: client.version,
          queryCount: getQueriesForClient().length,
          mutationCount: getMutationsForClient().length,
        },
      });
      loadErrorCodes(wsRpcClient, client.version);
    },
    { once: true, signal }
  );

  return {
    connected: new Promise<void>((resolve) =>
      ws.addEventListener("open", () => resolve(), { once: true, signal })
    ),
    unregister: cleanup,
    onCleanup: registerCleanup,
  };
}

function createWsAdapter(ws: WebSocket, signal: AbortSignal): MessageAdapter {
  return {
    addListener(listener) {
      const wrappedListener = (ev: MessageEvent<any>) => {
        listener(JSON.parse(ev.data));
      };
      ws.addEventListener("message", wrappedListener, { signal });
      return () => ws.removeEventListener("message", wrappedListener);
    },
    postMessage(message) {
      ws.send(JSON.stringify(message));
    },
  };
}

function getCleanupController() {
  const cleanupContoller = new AbortController();
  const cleanup = cleanupContoller.abort.bind(cleanupContoller);
  const signal = cleanupContoller.signal;
  setMaxListeners(20, signal);
  function registerCleanup(...cleanupFunctions: Array<() => void>) {
    for (const cleanupFn of cleanupFunctions) {
      if (signal.aborted) {
        cleanupFn();
      }
      signal.addEventListener("abort", () => cleanupFn(), {
        once: true,
      });
    }
  }
  return { cleanup, signal, registerCleanup };
}
