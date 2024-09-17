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
import { createId } from "../../utils/createId";

type Reason =
  | "WS_DISCONNECTED"
  | "CLIENT_GC"
  | "WS_ERROR"
  | "UNREGISTER"
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

export function registerClient(
  client: ApolloClient<any>,
  vsCodeServerUrl: string | URL
): {
  connected: Promise<void>;
  unregister: (reason?: Reason) => void;
  onCleanup: (cleanup: (reason: Reason) => void) => void;
} {
  const clientRef = new WeakRef(client);
  const registered = _registerClient(clientRef, vsCodeServerUrl);
  const registry = new FinalizationRegistry(registered.unregister);
  const unregisterToken = {};
  registry.register(client, "CLIENT_GC", unregisterToken);
  registered.onCleanup(() => registry.unregister(unregisterToken));
  return registered;
}

function makeErrorHandler(cleanup: (reason?: Reason) => void): EventListener {
  return (e) => {
    console.error("Apollo DevTools Client encountered WebSocket error:", e);
    cleanup("WS_ERROR");
  };
}

export function _registerClient(
  clientRef: WeakRef<ApolloClient<any>>,
  url: string | URL
): {
  connected: Promise<void>;
  unregister: (reason?: Reason) => void;
  onCleanup: (cleanup: (reason: Reason) => void) => void;
} {
  const { signal, cleanup, registerCleanup } = getCleanupController();

  function getClient() {
    const client = clientRef.deref();
    if (client) {
      return getPrivateAccess(client);
    } else {
      cleanup("CLIENT_GC");
    }
  }

  const ws = new WebSocket(url);
  registerCleanup(ws.close.bind(ws, 1000));
  ws.addEventListener("close", cleanup.bind(undefined, "WS_DISCONNECTED"), {
    once: true,
    signal,
  });
  ws.addEventListener("error", makeErrorHandler(cleanup), {
    once: true,
    signal,
  });

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

  const id = createId();

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
          id,
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
  function registerCleanup(
    ...cleanupFunctions: Array<(reason: Reason) => void>
  ) {
    for (const cleanupFn of cleanupFunctions) {
      if (signal.aborted) {
        cleanupFn(signal.reason);
      }
      signal.addEventListener("abort", () => cleanupFn(signal.reason), {
        once: true,
      });
    }
  }
  return {
    cleanup: (reason: Reason = "UNREGISTER") => cleanup(reason),
    signal,
    registerCleanup,
  };
}
