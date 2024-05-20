import browser from "webextension-polyfill";
import { createDevtoolsMachine } from "../../application/machines";
import type { Actor } from "../actor";
import { createPortActor } from "../actor";
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
      },
      unsubscribeFromAll: (_, event) => {
        if (event.type === "clientNotFound") {
          clearTimeout(connectTimeoutId);
        }
      },
    },
  })
).start();

let connectTimeoutId: NodeJS.Timeout;
let disconnectTimeoutId: NodeJS.Timeout;

const port = browser.runtime.connect({
  name: inspectedTabId.toString(),
});

const clientPort = createPortActor<ClientMessage>(port);
const rpcClient = createRpcClient<DevtoolsRPCMessage>(
  createPortMessageAdapter(port)
);

devtoolsMachine.subscribe(({ value }) => {
  if (value === "connected") {
    clearTimeout(disconnectTimeoutId);
  }
});

function pollUntilNextUpdate() {
  let id: NodeJS.Timeout;

  async function poll() {
    if (panelWindow) {
      const clientContext = await rpcClient.request("getClientOperations");
      panelWindow.send({ type: "update", payload: clientContext });
    }

    id = setTimeout(poll, 500);
  }

  const unsubscribe = clientPort.on("updateData", () => {
    clearTimeout(id);
    unsubscribe();
  });

  const subscription = devtoolsMachine.subscribe(({ value }) => {
    if (value !== "connected") {
      clearTimeout(id);
      subscription.unsubscribe();
    }
  });

  poll();
}

// In case we can't connect to the tab, we should at least show something to the
// user when we've attempted to connect a max number of times.
function startConnectTimeout(attempts = 0) {
  connectTimeoutId = setTimeout(() => {
    if (attempts < 3) {
      clientPort.send({ type: "connectToClient" });
      startConnectTimeout(attempts + 1);
    } else {
      devtoolsMachine.send("timeout");
    }
    // Pick a threshold above the time it takes to determine if the client is
    // found on the page. This ensures we don't reset that counter and provide a
    // proper "not found" message.
  }, 11_000);
}

clientPort.on("connectToDevtools", (message) => {
  devtoolsMachine.send({
    type: "connect",
    clientContext: message.payload,
  });
});

clientPort.on("registerClient", (message) => {
  devtoolsMachine.send({ type: "connect", clientContext: message.payload });

  // Unfortunately the action hook doesn't report updates if queries are kicked
  // off immediately after the client is created. While we should fix this bug
  // in Apollo Client itself, this ensures we show the latest client data until
  // the action hook next pushes data.
  pollUntilNextUpdate();
});

clientPort.on("disconnectFromDevtools", () => {
  clearTimeout(disconnectTimeoutId);
  devtoolsMachine.send("disconnect");

  disconnectTimeoutId = setTimeout(() => {
    devtoolsMachine.send("clientNotFound");
  }, 10_000);
});

clientPort.on("clientNotFound", () => {
  clearTimeout(connectTimeoutId);
  devtoolsMachine.send("clientNotFound");
});

clientPort.on("updateData", (message) => {
  if (panelWindow) {
    panelWindow.send({ type: "update", payload: message.payload });
  }
});

clientPort.send({ type: "connectToClient" });

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

    removeExplorerForward = clientPort.forward("explorerResponse", panelWindow);
    removeExplorerListener = panelWindow.forward("explorerRequest", clientPort);
    removeSubscriptionTerminationListener = panelWindow.forward(
      "explorerSubscriptionTermination",
      clientPort
    );
  });

  panel.onHidden.addListener(() => {
    removeExplorerForward();
    removeSubscriptionTerminationListener();
    removeExplorerListener();
  });
}

createDevtoolsPanel();
