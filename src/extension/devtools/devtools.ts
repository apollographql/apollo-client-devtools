import browser from "webextension-polyfill";
import type { DevtoolsMachine } from "../../application/machines";
import { devtoolsMachine } from "../../application/machines";
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
import { CLIENT_NOT_FOUND, RPC_MESSAGE_TIMEOUT } from "../errorMessages";
import type { GetContext } from "../../application/stateMachine";

const inspectedTabId = browser.devtools.inspectedWindow.tabId;

let panelHidden = true;

const port = browser.runtime.connect({
  name: inspectedTabId.toString(),
});

const clientPort = createPortActor<ClientMessage>(port);
const rpcClient = createRpcClient<DevtoolsRPCMessage>(
  createPortMessageAdapter(port)
);

let connectToClientPromise: Promise<
  GetContext<DevtoolsMachine>["clientContext"]
> | null = null;

async function connectToClient(attempts = 0) {
  if (attempts >= 3) {
    return devtoolsMachine.send({ type: "timeout" });
  }

  try {
    connectToClientPromise ||= rpcClient
      .withTimeout(15_000)
      .request("connectToClient");

    const clientContext = await connectToClientPromise;

    devtoolsMachine.send({
      type: "connect",
      context: { clientContext },
    });
  } catch (e) {
    if (e instanceof Error && e.message === CLIENT_NOT_FOUND) {
      return devtoolsMachine.send({ type: "clientNotFound" });
    }

    if (e instanceof Error && e.message === RPC_MESSAGE_TIMEOUT) {
      return connectToClient(attempts + 1);
    }

    // TODO: Add error state for unknown error
  } finally {
    connectToClientPromise = null;
  }
}

clientPort.on("connectToDevtools", (message) => {
  devtoolsMachine.send({
    type: "connect",
    context: {
      clientContext: message.payload,
    },
  });
});

clientPort.on("disconnectFromDevtools", () => {
  devtoolsMachine.send({ type: "disconnect" });
});

devtoolsMachine.onTransition("retrying", () => {
  connectToClient();
});

devtoolsMachine.onTransition("connected", () => {
  if (!panelHidden) {
    unsubscribers.add(startRequestInterval());
  }
});

devtoolsMachine.onTransition("disconnected", () => {
  unsubscribeFromAll();
});

devtoolsMachine.onTransition("notFound", () => {
  unsubscribeFromAll();
});

connectToClient();

function startRequestInterval(ms = 500) {
  let id: NodeJS.Timeout;

  async function getClientData() {
    if (panelWindow) {
      panelWindow.send({
        type: "update",
        payload: await rpcClient.request("getClientOperations"),
      });
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
      connectToClient();
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
