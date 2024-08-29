/* eslint-disable @typescript-eslint/no-explicit-any */
import type { WebSocketServer, RawData, WebSocket } from "ws";
import type { MessageAdapter } from "../messageAdapters";
import { createRpcClient, createRpcHandler } from "../rpc";
import { createActor } from "../actor";
import type { ApolloClientInfo } from "../../types";
import { createId } from "../../utils/createId";
import allErrorCodes from "../../../all-clients/errorcodes.json";
import { restoreErrorCodes } from "../../../all-clients/restore-errorcodes.mjs";

// copied into this file to ease type bundling for now
export interface PublicMessageAdapter {
  addListener: (listener: (message: unknown) => void) => () => void;
  postMessage: (message: unknown) => void;
}

export function runServer(
  server: WebSocketServer,
  adapter: PublicMessageAdapter
) {
  const clients = new Map<
    string,
    {
      rpcClient: ReturnType<typeof createRpcClient>;
      info: ApolloClientInfo;
    }
  >();

  const messageAdapter = adapter as MessageAdapter;
  const tab = createActor(messageAdapter);
  const handleRpc = createRpcHandler(messageAdapter);

  handleRpc("getClients", () =>
    Array.from(clients.values()).map(({ info }) => info)
  );
  handleRpc("getClient", (id) => clients.get(id)!.info);
  handleRpc("getQueries", (id) =>
    clients.get(id)!.rpcClient.request("getQueries", id)
  );
  handleRpc("getMutations", (id) =>
    clients.get(id)!.rpcClient.request("getMutations", id)
  );
  handleRpc("getCache", (id) =>
    clients.get(id)!.rpcClient.request("getCache", id)
  );

  server.on("connection", function connection(ws) {
    const id = createId();
    const wsAdapter = createSocketMessageAdapter(ws);
    const wsRpcClient = createRpcClient(wsAdapter);
    const wsRpcHandler = createRpcHandler(wsAdapter);
    const wsActor = createActor(wsAdapter);
    wsActor.on("registerClient", ({ payload }) => {
      payload.id = id;
      clients.set(id, {
        info: payload,
        rpcClient: wsRpcClient,
      });
      tab.send({ type: "registerClient", payload });
    });
    wsRpcHandler("getErrorCodes", (version) => {
      if (version in allErrorCodes.byVersion) {
        return restoreErrorCodes(allErrorCodes, version);
      }
    });
    ws.on("close", () => {
      if (clients.has(id)) {
        tab.send({ type: "clientTerminated", clientId: id });
        clients.delete(id);
      }
    });
    ws.on("message", function incoming(message) {
      console.log("server.ts received: %o", message);
    });
  });
}

function createSocketMessageAdapter(ws: WebSocket): MessageAdapter {
  return {
    addListener(listener) {
      const wrappedListener = (message: RawData) =>
        listener(JSON.parse(message.toString()));
      ws.on("message", wrappedListener);
      return () => void ws.off("message", wrappedListener);
    },
    postMessage(message) {
      ws.send(JSON.stringify(message));
    },
  };
}
