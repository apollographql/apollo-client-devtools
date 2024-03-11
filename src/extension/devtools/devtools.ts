import browser from "webextension-polyfill";
import { devtoolsMachine } from "../../application/machines";
import { Actor, createActor } from "../actor";
import { ClientMessage, DevtoolsRPCMessage, PanelMessage } from "../messages";
import { getPanelActor } from "./panelActor";
import { createPortMessageAdapter } from "../messageAdapters";
import { createRpcClient } from "../rpc";

const inspectedTabId = browser.devtools.inspectedWindow.tabId;

let panelHidden = true;
let connectTimeoutId: NodeJS.Timeout;

const port = browser.runtime.connect({
  name: inspectedTabId.toString(),
});

const portAdapter = createPortMessageAdapter(port);
const clientPort = createActor<ClientMessage>(portAdapter);
const rpcClient = createRpcClient<DevtoolsRPCMessage>(portAdapter);

// In case we can't connect to the tab, we should at least show something to the
// user when we've attempted to connect a max number of times.
function startConnectTimeout(attempts = 0) {
  connectTimeoutId = setTimeout(() => {
    if (attempts < 3) {
      clientPort.send({ type: "connectToClient" });
      startConnectTimeout(attempts + 1);
    } else {
      devtoolsMachine.send({ type: "timeout" });
    }
    // Pick a threshold above the time it takes to determine if the client is
    // found on the page. This ensures we don't reset that counter and provide a
    // proper "not found" message.
  }, 11_000);
}

clientPort.on("connectToDevtools", (message) => {
  devtoolsMachine.send({
    type: "connect",
    context: {
      clientContext: message.payload,
    },
  });
});

clientPort.on("connectToClientTimeout", () => {
  devtoolsMachine.send({ type: "timeout" });
});

clientPort.on("disconnectFromDevtools", () => {
  devtoolsMachine.send({ type: "disconnect" });
});

clientPort.on("clientNotFound", () => {
  clearTimeout(connectTimeoutId);
  devtoolsMachine.send({ type: "clientNotFound" });
});

devtoolsMachine.onTransition("retrying", () => {
  clientPort.send({ type: "connectToClient" });
});

devtoolsMachine.onTransition("connected", () => {
  clearTimeout(connectTimeoutId);

  if (!panelHidden) {
    unsubscribers.add(startRequestInterval());
  }
});

devtoolsMachine.onTransition("disconnected", () => {
  unsubscribeFromAll();
});

devtoolsMachine.onTransition("notFound", () => {
  clearTimeout(connectTimeoutId);
  unsubscribeFromAll();
});

clientPort.send({ type: "connectToClient" });

function startRequestInterval(ms = 500) {
  let id: NodeJS.Timeout;

  async function getClientData() {
    const payload = await rpcClient.request("getClientOperations", {});

    if (panelWindow) {
      panelWindow.send({ type: "update", payload });
    }
  }

  if (devtoolsMachine.matches("connected")) {
    getClientData();
    id = setInterval(() => getClientData(), ms);
  }

  return () => clearInterval(id);
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
      const state = devtoolsMachine.getState();

      panelWindow.send({
        type: "initializePanel",
        state: state.value,
        payload: state.context.clientContext,
      });

      panelWindow.on("retryConnection", () => {
        devtoolsMachine.send({ type: "retry" });
      });

      devtoolsMachine.subscribe(({ state }) => {
        panelWindow.send({ type: "devtoolsStateChanged", state: state.value });
      });

      connectedToPanel = true;
    }

    if (devtoolsMachine.matches("initialized")) {
      clientPort.send({ type: "connectToClient" });
      startConnectTimeout();
    }

    if (devtoolsMachine.matches("connected") && panelHidden) {
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
