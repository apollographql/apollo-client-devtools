/* eslint-disable @typescript-eslint/no-explicit-any */
import type { WebSocketServer, RawData, WebSocket } from "ws";
import { MessageAdapter } from "../messageAdapters";
import type { RPCRequest, RPCRequestMessage, RPCResponseMessage } from "../rpc";
import { createRpcClient, createRpcHandler } from "../rpc";
import { MessageType } from "../messages";
import { serializeError } from "../errorSerialization";
import type { Actor } from "../actor";
import { createActor } from "../actor";
import type { ApolloClientInfo } from "../../types";
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
      actor: Actor;
      info: ApolloClientInfo;
    }
  >();

  const messageAdapter = adapter as MessageAdapter;
  const vscodeActor = createActor(messageAdapter);

  messageAdapter.addListener((message) => {
    const { target } = message;

    if (message.type !== MessageType.RPCRequest || !target) {
      return;
    }

    if (target.type === "client" && clients.has(target.clientId)) {
      void handleRpcRequest(target.clientId, message).then((response) =>
        messageAdapter.postMessage(response)
      );
    }

    if (target.type === "aggregate") {
      void Promise.all(
        Array.from(clients.keys(), (id) => handleRpcRequest(id, message))
      ).then((results) =>
        messageAdapter.postMessage({
          type: MessageType.AggregateResponse,
          target,
          results,
        })
      );
    }
  });

  function handleRpcRequest(
    clientId: string,
    { id: sourceId, name, params, target }: RPCRequestMessage
  ) {
    const client = clients.get(clientId)!;
    const result =
      name === "getClient"
        ? Promise.resolve(client.info)
        : client.rpcClient.request(name as keyof RPCRequest, ...(params as []));

    return result.then(
      (result): RPCResponseMessage => ({
        type: MessageType.RPCResponse,
        target,
        sourceId,
        result,
      }),
      (error): RPCResponseMessage => ({
        type: MessageType.RPCResponse,
        target,
        sourceId,
        error: serializeError(error),
      })
    );
  }

  server.on("connection", function connection(ws) {
    let id: string | undefined;
    const wsAdapter = createSocketMessageAdapter(ws);
    const wsRpcClient = createRpcClient(wsAdapter);
    const wsRpcHandler = createRpcHandler(wsAdapter);
    const wsActor = createActor(wsAdapter);
    wsActor.on("registerClient", (message) => {
      id = message.payload.id;
      clients.set(id, {
        info: message.payload,
        actor: wsActor,
        rpcClient: wsRpcClient,
      });
      messageAdapter.postMessage({
        type: MessageType.ConnectClient,
        clientId: id,
      });
    });
    wsActor.on("explorerResponse", (message) => {
      vscodeActor.send(message);
    });
    wsRpcHandler("getErrorCodes", (version) => {
      if (version in allErrorCodes.byVersion) {
        return restoreErrorCodes(allErrorCodes, version);
      }
    });
    ws.on("close", () => {
      if (id && clients.has(id)) {
        messageAdapter.postMessage({
          type: MessageType.DisconnectClient,
          clientId: id,
        });
        clients.delete(id);
      }
    });
  });

  vscodeActor.on("explorerRequest", (message) => {
    const { clientId } = message.payload;
    const client = clients.get(clientId);
    if (!client) {
      throw new Error("Could not find selected client");
    }
    client.actor.send(message);
  });
  vscodeActor.on("explorerSubscriptionTermination", () => {
    for (const client of clients.values()) {
      client.actor.send({ type: "explorerSubscriptionTermination" });
    }
  });
}

function createSocketMessageAdapter(ws: WebSocket): MessageAdapter {
  return new MessageAdapter({
    addListener(listener) {
      const wrappedListener = (message: RawData) =>
        listener(JSON.parse(message.toString()));
      ws.on("message", wrappedListener);
      return () => void ws.off("message", wrappedListener);
    },
    postMessage(message) {
      ws.send(JSON.stringify(message));
    },
  });
}
