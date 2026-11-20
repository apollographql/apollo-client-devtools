import type { ApolloClientInfo } from "@/types";
import type browser from "webextension-polyfill";
import { createExternalPortMessageAdapter } from "../messageAdapters";
import { handleErrorCodes } from "./errorcodes";
import { createActor, type Actor } from "../actor";
import type { MessageAdapter } from "../messageAdapters";
import { MessageType, type ApolloClientDevtoolsMessage } from "../messages";
import { serializeError } from "../errorSerialization";
import { createRpcClient, createRpcHandler } from "../rpc";

interface Connection {
  adapter: MessageAdapter;
  actor: Actor;
  rpc: ReturnType<typeof createRpcClient>;
  abort: AbortController;
  clients: Map<string, Client>;
  requests: Set<string>;
  streams: Set<string>;
}

interface Client {
  connection: Connection;
  info: ApolloClientInfo;
}

export function createBackgroundRouter() {
  const tabs = new Map<
    number,
    {
      router: ReturnType<typeof createTabRouter>;
      connections: number;
    }
  >();

  return {
    onConnect(port: browser.Runtime.Port) {
      const isContentScript = port.name === "tab";
      const tabId = isContentScript ? port.sender?.tab?.id : Number(port.name);
      if (tabId == null || !Number.isInteger(tabId)) return;

      let tab = tabs.get(tabId);
      if (!tab) {
        tab = { router: createTabRouter(), connections: 0 };
        tabs.set(tabId, tab);
      }
      const adapter = createExternalPortMessageAdapter(port);
      const disconnect = isContentScript
        ? tab.router.connectFrame(adapter)
        : tab.router.connectPanel(adapter);
      tab.connections++;
      port.onDisconnect.addListener(() => {
        disconnect();
        if (--tab.connections === 0) tabs.delete(tabId);
      });
    },
  };
}

// Each tab keeps its own clients and panel, preserving upstream client IDs.
export function createTabRouter() {
  const connections = new Set<Connection>();
  const clientConnections = new Map<string, Connection>();
  let panel: Actor | undefined;
  let panelAdapter: MessageAdapter | undefined;
  function receive(
    connection: Connection,
    message: ApolloClientDevtoolsMessage
  ) {
    if (
      message.type === MessageType.RPCStreamChunk ||
      message.type === MessageType.RPCTerminateStream
    ) {
      if (!connection.streams.has(message.streamId)) return;
      if (message.type === MessageType.RPCTerminateStream)
        connection.streams.delete(message.streamId);
      panelAdapter?.postMessage(message);
    } else if (
      message.type === MessageType.RPCResponse ||
      message.type === MessageType.PostMessageError
    ) {
      if (
        message.type === MessageType.PostMessageError &&
        connection.streams.delete(message.sourceId)
      ) {
        panelAdapter?.postMessage({
          type: MessageType.RPCTerminateStream,
          streamId: message.sourceId,
        });
        return;
      }
      if (!connection.requests.delete(message.sourceId)) return;
      panelAdapter?.postMessage(message);
    }
  }
  let disconnectPanel: (() => void) | undefined;

  function register(connection: Connection, info: ApolloClientInfo) {
    let client = connection.clients.get(info.id);
    if (!client) {
      client = {
        connection,
        info,
      };
      connection.clients.set(info.id, client);
      clientConnections.set(client.info.id, connection);
      panel?.send({ type: "registerClient", payload: client.info });
    } else {
      client.info = info;
    }
    return client;
  }

  function unregister(client: Client) {
    client.connection.clients.delete(client.info.id);
    clientConnections.delete(client.info.id);
    panel?.send({ type: "clientTerminated", clientId: client.info.id });
  }

  async function discover(connection: Connection) {
    try {
      const infos = await connection.rpc
        .withTimeout(1000)
        .request("getClients");
      if (connection.abort.signal.aborted) return;
      const ids = new Set(infos.map((info) => info.id));
      for (const client of connection.clients.values()) {
        if (!ids.has(client.info.id)) unregister(client);
      }
      infos.forEach((info) => register(connection, info));
    } catch {
      // An unresponsive frame must not prevent discovery in other frames.
    }
  }

  return {
    connectFrame(adapter: MessageAdapter) {
      const abort = new AbortController();
      handleErrorCodes(adapter, abort.signal);
      const connection: Connection = {
        adapter,
        actor: createActor(adapter),
        rpc: createRpcClient(adapter).withSignal(abort.signal),
        abort,
        clients: new Map(),
        requests: new Set(),
        streams: new Set(),
      };
      connections.add(connection);
      const removeListener = adapter.addListener((message) =>
        receive(connection, message)
      );
      connection.actor.on(
        "registerClient",
        ({ payload }) => {
          register(connection, payload);
        },
        { signal: abort.signal }
      );
      connection.actor.on(
        "clientTerminated",
        ({ clientId }) => {
          const client = connection.clients.get(clientId);
          if (client) unregister(client);
        },
        { signal: abort.signal }
      );
      connection.actor.on(
        "explorerResponse",
        (message) => panel?.send(message),
        { signal: abort.signal }
      );
      // Registrations sent before a runtime reconnect may have been lost.
      void discover(connection);
      return () => {
        removeListener();
        abort.abort();
        connections.delete(connection);
        for (const id of connection.requests) {
          panelAdapter?.postMessage({
            type: MessageType.RPCResponse,
            sourceId: id,
            error: serializeError(
              new Error("Apollo Client is no longer connected")
            ),
          });
        }
        for (const id of connection.streams) {
          panelAdapter?.postMessage({
            type: MessageType.RPCTerminateStream,
            streamId: id,
          });
        }
        connection.requests.clear();
        connection.streams.clear();
        for (const client of connection.clients.values()) unregister(client);
      };
    },

    connectPanel(adapter: MessageAdapter) {
      disconnectPanel?.();
      const abort = new AbortController();
      const options = { signal: abort.signal };
      const actor = createActor(adapter);
      panel = actor;
      panelAdapter = adapter;
      const handle = createRpcHandler(adapter);
      handle(
        "getClients",
        async () => {
          await Promise.all([...connections].map(discover));
          return [...connections].flatMap((connection) =>
            [...connection.clients.values()].map(({ info }) => info)
          );
        },
        options
      );
      const removeListener = adapter.addListener((message) => {
        if (message.type === MessageType.RPCTerminateStream) {
          for (const connection of connections) {
            if (connection.streams.delete(message.streamId)) {
              connection.adapter.postMessage(message);
              break;
            }
          }
          return;
        }
        if (
          message.type !== MessageType.RPCRequest &&
          message.type !== MessageType.RPCStartStream
        )
          return;
        if (
          message.type === MessageType.RPCRequest &&
          message.name === "getClients"
        )
          return;
        const clientId = message.params[0] as string;
        const connection = clientConnections.get(clientId);
        const stream = message.type === MessageType.RPCStartStream;
        if (!connection) {
          adapter.postMessage(
            stream
              ? { type: MessageType.RPCTerminateStream, streamId: message.id }
              : message.name === "getClient"
                ? {
                    type: MessageType.RPCResponse,
                    sourceId: message.id,
                    result: null,
                  }
                : {
                    type: MessageType.RPCResponse,
                    sourceId: message.id,
                    error: serializeError(
                      new Error("Apollo Client is no longer connected")
                    ),
                  }
          );
          return;
        }
        // Preserve panel IDs; accept replies only from the selected connection.
        const id = message.id;
        const pending = stream ? connection.streams : connection.requests;
        pending.add(id);
        try {
          connection.adapter.postMessage(message);
        } catch (error) {
          pending.delete(id);
          adapter.postMessage(
            stream
              ? { type: MessageType.RPCTerminateStream, streamId: id }
              : {
                  type: MessageType.RPCResponse,
                  sourceId: id,
                  error: serializeError(error),
                }
          );
        }
      });

      actor.on(
        "explorerRequest",
        (message) => {
          clientConnections.get(message.payload.clientId)?.actor.send(message);
        },
        options
      );
      actor.on(
        "explorerSubscriptionTermination",
        (message) => {
          for (const connection of connections) connection.actor.send(message);
        },
        options
      );

      const disconnect = () => {
        removeListener();
        abort.abort();
        for (const connection of connections) {
          for (const id of connection.streams) {
            connection.adapter.postMessage({
              type: MessageType.RPCTerminateStream,
              streamId: id,
            });
          }
          connection.requests.clear();
          connection.streams.clear();
          connection.actor.send({ type: "explorerSubscriptionTermination" });
        }
        if (panel === actor) {
          panel = undefined;
          panelAdapter = undefined;
        }
      };
      disconnectPanel = disconnect;
      return () => {
        if (disconnectPanel === disconnect) {
          disconnect();
          disconnectPanel = undefined;
        }
      };
    },
  };
}
