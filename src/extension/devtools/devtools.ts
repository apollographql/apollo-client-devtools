import browser from "webextension-polyfill";
import { createDevtoolsMachine } from "../../application/machines";
import type { Actor } from "../actor";
import { createActor } from "../actor";
import type {
  ClientMessage,
  DevtoolsRPCMessage,
  PanelMessage,
} from "../messages";
import { getPanelActor } from "./panelActor";
import { createPortMessageAdapter } from "../messageAdapters";
import { createRpcClient } from "../rpc";
import { interpret } from "@xstate/fsm";

const inspectedTabId = browser.devtools.inspectedWindow.tabId;

const devtoolsMachine = interpret(
  createDevtoolsMachine({
    actions: {
      connectToClient: () => {
        clientPort.send({ type: "connectToClient" });
        startConnectTimeout();
      },
      startRequestInterval: () => {
        clearTimeout(connectTimeoutId);

        if (!panelHidden) {
          unsubscribers.add(startRequestInterval());
        }
      },
      unsubscribeFromAll: (_, event) => {
        if (event.type === "clientNotFound") {
          clearTimeout(connectTimeoutId);
        }
        unsubscribeFromAll();
      },
    },
  })
).start();

let panelHidden = true;
let connectTimeoutId: NodeJS.Timeout;

const portAdapter = createPortMessageAdapter(() =>
  browser.runtime.connect({ name: inspectedTabId.toString() })
);

const clientPort = createActor<ClientMessage>(portAdapter);
const rpcClient = createRpcClient<DevtoolsRPCMessage>(portAdapter);

devtoolsMachine.subscribe(({ value }) => {
  if (value === "connected") {
    clearTimeout(connectTimeoutId);
  }
});

function startConnectTimeout() {
  clearTimeout(connectTimeoutId);

  connectTimeoutId = setTimeout(() => {
    devtoolsMachine.send("clientNotFound");
  }, 10_000);
}

clientPort.on("connectToDevtools", (message) => {
  devtoolsMachine.send({
    type: "connect",
    clientContext: message.payload,
  });
});

clientPort.on("registerClient", (message) => {
  devtoolsMachine.send({ type: "connect", clientContext: message.payload });
});

clientPort.on("disconnectFromDevtools", () => {
  clearTimeout(connectTimeoutId);
  devtoolsMachine.send("disconnect");
  startConnectTimeout();
});

clientPort.send({ type: "connectToClient" });

function startRequestInterval(ms = 500) {
  let id: NodeJS.Timeout;

  async function getClientData() {
    try {
      if (panelWindow) {
        panelWindow.send({
          type: "update",
          payload: await rpcClient.request("getClientOperations"),
        });
      }
    } finally {
      id = setTimeout(getClientData, ms);
    }
  }

  if (devtoolsMachine.state.value === "connected") {
    getClientData();
  }

  return () => clearTimeout(id);
}

const unsubscribers = new Set<() => void>();

function unsubscribeFromAll() {
  unsubscribers.forEach((unsubscribe) => unsubscribe());
  unsubscribers.clear();
}

let connectedToPanel = false;
let panelWindow: Actor<PanelMessage>;

async function createDevtoolsPanel() {
  const panel = await browser.devtools.panels.create(
    "Apollo",
    "",
    "panel.html"
  );

  let removeExplorerForward: () => void;
  let removeSubscriptionTerminationListener: () => void;
  let removeExplorerListener: () => void;

  panel.onShown.addListener((window) => {
    panelWindow = getPanelActor(window);

    if (!connectedToPanel) {
      panelWindow.send({
        type: "initializePanel",
        state: devtoolsMachine.state.value,
        payload: devtoolsMachine.state.context.clientContext,
      });

      panelWindow.on("retryConnection", () => {
        devtoolsMachine.send("retry");
      });

      devtoolsMachine.subscribe(({ value }) => {
        panelWindow.send({ type: "devtoolsStateChanged", state: value });
      });

      connectedToPanel = true;
    }

    if (devtoolsMachine.state.value === "initialized") {
      clientPort.send({ type: "connectToClient" });
      startConnectTimeout();
    }

    if (devtoolsMachine.state.value === "connected" && panelHidden) {
      unsubscribers.add(startRequestInterval());
    }

    removeExplorerForward = clientPort.forward("explorerResponse", panelWindow);
    removeExplorerListener = panelWindow.forward("explorerRequest", clientPort);
    removeSubscriptionTerminationListener = panelWindow.forward(
      "explorerSubscriptionTermination",
      clientPort
    );

    panelHidden = false;
  });

  panel.onHidden.addListener(() => {
    panelHidden = true;
    unsubscribeFromAll();

    removeExplorerForward();
    removeSubscriptionTerminationListener();
    removeExplorerListener();
  });
}

createDevtoolsPanel();
