import browser, { devtools } from "webextension-polyfill";
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
import { RPC_MESSAGE_TIMEOUT } from "../errorMessages";

const inspectedTabId = browser.devtools.inspectedWindow.tabId;

const devtoolsMachine = interpret(
  createDevtoolsMachine({
    actions: {
      connectToClient: () => {
        // clientPort.send({ type: "connectToClient" });
        // startConnectTimeout();
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

const port = browser.runtime.connect({
  name: inspectedTabId.toString(),
});

const clientPort = createPortActor<ClientMessage>(port);
const rpcClient = createRpcClient<DevtoolsRPCMessage>(
  createPortMessageAdapter(port)
);

let isConnectingToClient = false;

async function connectToClient(attempts = 0): Promise<void> {
  if (isConnectingToClient) {
    return;
  }

  isConnectingToClient = true;

  try {
    const clientContext = await rpcClient
      .withTimeout(1000)
      .request("getClientOperations");

    if (clientContext) {
      return devtoolsMachine.send({ type: "connect", clientContext });
    }

    if (attempts >= 10) {
      devtoolsMachine.send("clientNotFound");
    } else {
      connectToClient(attempts + 1);
    }
  } catch (e) {
    const isTimeoutError =
      e instanceof Error && e.message === RPC_MESSAGE_TIMEOUT;

    if (isTimeoutError && attempts >= 3) {
      return devtoolsMachine.send("timeout");
    }

    if (isTimeoutError) {
      return connectToClient(attempts + 1);
    }

    if (process.env.NODE_ENV === "development") {
      console.error(e);
    }
  } finally {
    isConnectingToClient = false;
  }
}

// In case we can't connect to the tab, we should at least show something to the
// user when we've attempted to connect a max number of times.
// function startConnectTimeout(attempts = 0) {
//   connectTimeoutId = setTimeout(() => {
//     if (attempts < 3) {
//       // clientPort.send({ type: "connectToClient" });
//       startConnectTimeout(attempts + 1);
//     } else {
//       devtoolsMachine.send("timeout");
//     }
//     // Pick a threshold above the time it takes to determine if the client is
//     // found on the page. This ensures we don't reset that counter and provide a
//     // proper "not found" message.
//   }, 11_000);
// }

clientPort.on("pageLoaded", () => {
  connectToClient();
});

// clientPort.on("connectToDevtools", (message) => {
//   devtoolsMachine.send({
//     type: "connect",
//     clientContext: message.payload,
//   });
// });

clientPort.on("connectToClientTimeout", () => {
  devtoolsMachine.send("timeout");
});

clientPort.on("disconnectFromDevtools", () => {
  devtoolsMachine.send("disconnect");
});

clientPort.on("clientNotFound", () => {
  clearTimeout(connectTimeoutId);
  devtoolsMachine.send("clientNotFound");
});

// clientPort.send({ type: "connectToClient" });

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
      // clientPort.send({ type: "connectToClient" });
      // startConnectTimeout();
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
