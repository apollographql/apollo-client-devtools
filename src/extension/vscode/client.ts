/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApolloClient } from "@apollo/client";
import { getPrivateAccess } from "../../privateAccess";
import { createActor } from "../actor";
import { createRpcClient, createRpcHandler } from "../rpc";
import { getQueries, getMutations } from "../tab/helpers";
import { loadErrorCodes } from "../tab/loadErrorCodes";
import type { MessageAdapter } from "../messageAdapters";
import { handleExplorerRequests } from "../tab/handleExplorerRequests";

export function registerClient(
  client: ApolloClient<any>,
  url: string | URL
): {
  connected: Promise<void>;
  unregister: () => void;
} {
  const { signal, cleanup, registerCleanup } = getCleanupController();

  const ac = getPrivateAccess(client);

  const ws = new WebSocket(url);
  registerCleanup(ws.close.bind(ws));
  ws.addEventListener("close", cleanup, { once: true, signal });

  const wsAdapter = createWsAdapter(ws, signal);
  const wsRpcClient = createRpcClient(wsAdapter);
  const wsRpcHandler = createRpcHandler(wsAdapter);
  const wsActor = createActor(wsAdapter);
  function getQueriesForClient() {
    return getQueries(ac.queryManager.getObservableQueries("active"));
  }
  function getMutationsForClient() {
    return getMutations(ac?.queryManager.mutationStore ?? {});
  }
  registerCleanup(
    wsRpcHandler("getQueries", getQueriesForClient),
    wsRpcHandler("getMutations", getMutationsForClient),
    wsRpcHandler("getCache", () => ac.cache.extract(true) ?? {}),
    handleExplorerRequests(wsActor, () => client)
  );

  ws.addEventListener(
    "open",
    function open() {
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

  const originalStop = client.stop;
  client.stop = function () {
    cleanup();
    originalStop.call(client);
  };
  registerCleanup(() => {
    client.stop = originalStop;
  });
  return {
    connected: new Promise<void>((resolve) =>
      ws.addEventListener("open", () => resolve(), { once: true, signal })
    ),
    unregister: cleanup,
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
