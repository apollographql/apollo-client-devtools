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
import { RPC_MESSAGE_TIMEOUT } from "../errorMessages";

const inspectedTabId = browser.devtools.inspectedWindow.tabId;

const devtoolsMachine = interpret(
  createDevtoolsMachine({
    actions: {
      connectToClient,
      startRequestInterval: () => {
        if (!panelHidden) {
          unsubscribers.add(startRequestInterval());
        }
      },
      unsubscribeFromAll,
    },
  })
).start();

let panelHidden = true;

const port = browser.runtime.connect({
  name: inspectedTabId.toString(),
});

const clientPort = createPortActor<ClientMessage>(port);
const rpcClient = createRpcClient<DevtoolsRPCMessage>(
  createPortMessageAdapter(port)
);

let isConnectingToClient = false;
let connectController = new AbortController();

function connectToClient() {
  if (isConnectingToClient || devtoolsMachine.state.value === "connected") {
    return;
  }

  connectController = new AbortController();
  const signal = connectController.signal;
  connect();

  async function connect(attempts = 0) {
    if (signal.aborted) {
      return;
    }

    isConnectingToClient = true;

    try {
      const clientContext = await rpcClient
        .withTimeout(1000)
        .request("getClientOperations");

      if (signal.aborted) {
        return;
      }

      if (clientContext) {
        return devtoolsMachine.send({ type: "connect", clientContext });
      }

      if (attempts >= 10) {
        devtoolsMachine.send("clientNotFound");
      } else {
        connect(attempts + 1);
      }
    } catch (e) {
      // A timeout error indicates that we are unable to communicate with the
      // tab since we never got a message back. We'll attempt to connect up to 3
      // times (~3 sec) before giving up and letting the user know.
      const isTimeoutError =
        e instanceof Error && e.message === RPC_MESSAGE_TIMEOUT;

      if (isTimeoutError && attempts >= 3) {
        return devtoolsMachine.send("timeout");
      }

      if (isTimeoutError) {
        return connect(attempts + 1);
      }

      if (process.env.NODE_ENV === "development") {
        console.error(e);
      }
    } finally {
      isConnectingToClient = false;
    }
  }
}

clientPort.on("pageUnloaded", () => {
  connectController.abort();
  devtoolsMachine.send("disconnect");
});

clientPort.on("clientRegistered", connectToClient);

clientPort.on("clientTerminated", () => {
  devtoolsMachine.send("disconnect");
});

connectToClient();

function startRequestInterval(ms = 500) {
  let id: NodeJS.Timeout;

  async function getClientData() {
    try {
      if (panelWindow) {
        const payload = await rpcClient.request("getClientOperations");

        if (payload === null) {
          return devtoolsMachine.send("disconnect");
        }

        panelWindow.send({ type: "update", payload });
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
