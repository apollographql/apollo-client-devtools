import type { ApolloClientInfo } from "@/types";
import { createId } from "../../utils/createId";
import type browser from "webextension-polyfill";
import { createExternalPortMessageAdapter } from "../messageAdapters";
import { handleErrorCodes } from "./errorcodes";
import { createActor, type Actor } from "../actor";
import type { MessageAdapter } from "../messageAdapters";
import { MessageType, type ApolloClientDevtoolsMessage } from "../messages";
import { serializeError } from "../errorSerialization";
import { createRpcClient, createRpcHandler } from "../rpc";

function failureReply(
  id: string,
  stream: boolean,
  error: unknown = new Error("Apollo Client is no longer connected")
) {
  return stream
    ? { type: MessageType.RPCTerminateStream as const, streamId: id }
    : {
        type: MessageType.RPCResponse as const,
        sourceId: id,
        error: serializeError(error),
      };
}

interface Connection {
  adapter: MessageAdapter;
  actor: Actor;
  rpc: ReturnType<typeof createRpcClient>;
  abort: AbortController;
  id: string;
  info?: ApolloClientInfo;
  requests: Set<string>;
  streams: Set<string>;
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
      const isContentScript = port.name === "tab" || port.name === "client";
      const tabId = isContentScript ? port.sender?.tab?.id : Number(port.name);
      if (tabId == null || !Number.isInteger(tabId)) return;

      let tab = tabs.get(tabId);
      if (!tab) {
        tab = { router: createTabRouter(), connections: 0 };
        tabs.set(tabId, tab);
      }
      const adapter = createExternalPortMessageAdapter(port);
      const disconnect =
        port.name === "tab"
          ? tab.router.connectFrame(adapter)
          : port.name === "client"
            ? tab.router.connectClient(adapter)
            : tab.router.connectPanel(adapter);
      tab.connections++;
      port.onDisconnect.addListener(() => {
        disconnect();
        if (--tab.connections === 0) tabs.delete(tabId);
      });
    },
  };
}

// Each client connection gets its sole ID here. Frame connections carry control traffic.
export function createTabRouter() {
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

  async function discover(connection: Connection) {
    try {
      const metadata = await connection.rpc
        .withTimeout(1000)
        .request("getClientMetadata");
      if (connection.abort.signal.aborted) return;
      const first = !connection.info;
      connection.info = { ...metadata, id: connection.id };
      if (first)
        panel?.send({ type: "registerClient", payload: connection.info });
    } catch {
      // Keep the last metadata when a connected client misses a refresh.
    }
  }

  return {
    connectFrame(adapter: MessageAdapter) {
      const abort = new AbortController();
      handleErrorCodes(adapter, abort.signal);
      return () => abort.abort();
    },

    connectClient(adapter: MessageAdapter) {
      const abort = new AbortController();
      const connection: Connection = {
        adapter,
        actor: createActor(adapter),
        rpc: createRpcClient(adapter).withSignal(abort.signal),
        abort,
        id: createId(),
        requests: new Set(),
        streams: new Set(),
      };
      clientConnections.set(connection.id, connection);
      const removeListener = adapter.addListener((message) =>
        receive(connection, message)
      );
      connection.actor.on(
        "explorerResponse",
        (message) => panel?.send(message),
        { signal: abort.signal }
      );
      // A newly connected or reconnected client supplies its current metadata.
      void discover(connection);
      function disconnect() {
        if (abort.signal.aborted) return;
        removeListener();
        abort.abort();
        clientConnections.delete(connection.id);
        for (const id of connection.requests) {
          panelAdapter?.postMessage(failureReply(id, false));
        }
        for (const id of connection.streams) {
          panelAdapter?.postMessage(failureReply(id, true));
        }
        connection.requests.clear();
        connection.streams.clear();
        if (connection.info)
          panel?.send({ type: "clientTerminated", clientId: connection.id });
      }
      return disconnect;
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
          await Promise.all([...clientConnections.values()].map(discover));
          return [...clientConnections.values()].flatMap(({ info }) =>
            info ? [info] : []
          );
        },
        options
      );
      handle(
        "getClient",
        async (id) => {
          const connection = clientConnections.get(id);
          if (!connection) return null;
          const info = await connection.rpc.request("getClientMetadata");
          if (connection.abort.signal.aborted) return null;
          return { ...info, id: connection.id };
        },
        options
      );
      const removeListener = adapter.addListener((message) => {
        if (message.type === MessageType.RPCTerminateStream) {
          for (const connection of clientConnections.values()) {
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
          (message.name === "getClients" || message.name === "getClient")
        )
          return;
        const clientId = message.params[0] as string;
        const connection = clientConnections.get(clientId);
        const stream = message.type === MessageType.RPCStartStream;
        if (!connection) {
          adapter.postMessage(failureReply(message.id, stream));
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
          adapter.postMessage(failureReply(id, stream, error));
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
          for (const connection of clientConnections.values())
            connection.actor.send(message);
        },
        options
      );

      const disconnect = () => {
        removeListener();
        abort.abort();
        for (const connection of clientConnections.values()) {
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
