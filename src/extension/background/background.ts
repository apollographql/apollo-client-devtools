import browser from "webextension-polyfill";
import { handleErrorCodes } from "./errorcodes";
import type { DevtoolsMessage, MessageTarget } from "../messages";
import {
  createDevtoolsMessage,
  isDevtoolsMessage,
  MessageType,
} from "../messages";

type AggregateMessageTarget = Extract<MessageTarget, { type: "aggregate" }>;

class AggregateRequest {
  private readonly ids: string[];

  private pending: Set<string>;
  private messages: DevtoolsMessage[] = [];

  private connection: TabConnection;
  private target: AggregateMessageTarget;

  constructor(connection: TabConnection, target: AggregateMessageTarget) {
    this.connection = connection;
    this.ids = Array.from(connection.clients.keys());
    this.pending = new Set(this.ids);
    this.target = target;
  }

  send(message: DevtoolsMessage) {
    for (const [, { port }] of this.connection.clients) {
      postMessage(port, message);
    }

    this.maybeRespond();
  }

  complete(clientId: string, message: DevtoolsMessage) {
    if (!this.pending.has(clientId)) return;

    const index = this.ids.findIndex((id) => id === clientId);

    this.pending.delete(clientId);
    this.messages[index] = message;
    this.maybeRespond();
  }

  private maybeRespond() {
    if (this.pending.size > 0) return;

    aggregateRequests.delete(this.target.id);
    postMessage(
      this.connection.devtools,
      createDevtoolsMessage({
        type: MessageType.AggregateResponse,
        results: this.messages.filter(Boolean),
        target: this.target,
      })
    );
  }
}

interface ClientConnection {
  port: browser.Runtime.Port;
}

interface TabConnection {
  clients: Map<string, ClientConnection>;
  devtools: browser.Runtime.Port | null;
}

const tabs = new Map<number, TabConnection>();
const aggregateRequests = new Map<string, AggregateRequest>();

function getTab(id: number) {
  let tab = tabs.get(id);

  if (!tab) {
    tabs.set(id, (tab = { clients: new Map(), devtools: null }));
  }

  return tab;
}

function maybeRemoveTab(tabId: number) {
  const tab = tabs.get(tabId);

  if (tab && tab.clients.size === 0 && !tab.devtools) {
    tabs.delete(tabId);
  }
}

function postMessage(
  port: browser.Runtime.Port | null | undefined,
  message: unknown
) {
  try {
    port?.postMessage(message);
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to post connection to disconnected port", e);
    }
  }
}

function connectDevtoolsPort(port: browser.Runtime.Port) {
  const tabId = +port.name;

  const tab = getTab(tabId);
  tab.devtools = port;

  port.onMessage.addListener((message) => {
    if (!isDevtoolsMessage(message)) return;

    const { target } = message;

    if (target?.type === "client") {
      const connection = tab.clients.get(target.clientId);
      postMessage(connection?.port, message);
    }

    if (target?.type === "aggregate") {
      const request = new AggregateRequest(tab, target);
      aggregateRequests.set(target.id, request);

      request.send(message);
    }
  });

  port.onDisconnect.addListener(() => {
    if (tab.devtools !== port) return;

    tab.devtools = null;

    for (const [, { port }] of tab.clients) {
      postMessage(
        port,
        createDevtoolsMessage({ type: MessageType.DevtoolsDisconnected })
      );
    }

    maybeRemoveTab(tabId);
  });
}

function connectClientPort(port: browser.Runtime.Port) {
  const tabId = port.sender?.tab?.id;
  const clientId = port.name.replace("client:", "");

  if (tabId == null) return;

  const tab = getTab(tabId);
  tab.clients.set(clientId, { port });

  postMessage(
    tab.devtools,
    createDevtoolsMessage({ type: MessageType.ConnectClient, clientId })
  );

  port.onMessage.addListener((message) => {
    if (!isDevtoolsMessage(message)) return;

    const { target } = message;

    if (target?.type === "aggregate") {
      const request = aggregateRequests.get(target.id);

      request?.complete(clientId, message);
      return;
    }

    postMessage(tab.devtools, message);
  });

  port.onDisconnect.addListener(() => {
    postMessage(
      tab.devtools,
      createDevtoolsMessage({ type: MessageType.DisconnectClient, clientId })
    );
    tab.clients.delete(clientId);
    maybeRemoveTab(tabId);
  });
}

browser.runtime.onConnect.addListener((port) => {
  if (port.name === "tab") {
    return handleErrorCodes(port);
  }

  if (port.name.startsWith("client:")) {
    return connectClientPort(port);
  }

  // The devtools port is identified by the tab id
  if (!isNaN(+port.name)) {
    return connectDevtoolsPort(port);
  }

  throw new Error(`Unknown port ${port.name} connected`);
});
