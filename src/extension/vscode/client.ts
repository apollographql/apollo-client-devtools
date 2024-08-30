/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApolloClient } from "@apollo/client";
import { getPrivateAccess } from "../../privateAccess";
import { createActor } from "../actor";
import { createRpcClient, createRpcHandler } from "../rpc";
import { getQueries, getMutations } from "../tab/helpers";
import { loadErrorCodes } from "../tab/loadErrorCodes";
import type { MessageAdapter } from "../messageAdapters";
import { handleExplorerRequests } from "../tab/handleExplorerRequests";

export function registerClient(client: ApolloClient<any>, url: string | URL) {
  const ac = getPrivateAccess(client);
  const ws = new WebSocket(url);

  const wsAdapter: MessageAdapter = {
    addListener(listener) {
      const wrappedListener = (ev: MessageEvent<any>) => {
        listener(JSON.parse(ev.data));
      };
      ws.addEventListener("message", wrappedListener);
      return () => ws.removeEventListener("message", wrappedListener);
    },
    postMessage(message) {
      ws.send(JSON.stringify(message));
    },
  };
  const wsRpcClient = createRpcClient(wsAdapter);
  const wsRpcHandler = createRpcHandler(wsAdapter);
  const wsActor = createActor(wsAdapter);
  function getQueriesForClient() {
    return getQueries(ac.queryManager.getObservableQueries("active"));
  }
  function getMutationsForClient() {
    return getMutations(ac?.queryManager.mutationStore ?? {});
  }
  wsRpcHandler("getQueries", getQueriesForClient);
  wsRpcHandler("getMutations", getMutationsForClient);
  wsRpcHandler("getCache", () => ac.cache.extract(true) ?? {});
  handleExplorerRequests(wsActor, () => client);
  ws.addEventListener("open", function open() {
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
  });

  const originalStop = client.stop;

  client.stop = () => {
    ws.close();
    originalStop.call(client);
  };
}
