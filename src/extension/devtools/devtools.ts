import { EXPLORER_SUBSCRIPTION_TERMINATION } from "../../application/components/Explorer/postMessageHelpers";
import Relay from "../../Relay";
import {
  CONNECT_TO_CLIENT,
  REQUEST_DATA,
  UPDATE,
  EXPLORER_REQUEST,
  CONNECT_TO_DEVTOOLS,
  CONNECT_TO_CLIENT_TIMEOUT,
  DISCONNECT_FROM_DEVTOOLS,
  CLIENT_NOT_FOUND,
  DEVTOOLS_STATE_CHANGED,
  INITIALIZE_PANEL,
  RETRY_CONNECTION,
} from "../constants";
import browser from "webextension-polyfill";
import { QueryInfo } from "../tab/helpers";
import { JSONObject } from "../../application/types/json";
import { devtoolsMachine } from "../../application/machines";

const inspectedTabId = browser.devtools.inspectedWindow.tabId;
const devtools = new Relay();

let panelHidden = true;
let connectTimeoutId: NodeJS.Timeout;

const port = browser.runtime.connect({
  name: `devtools-${inspectedTabId}`,
});
port.onMessage.addListener(devtools.broadcast);

devtools.addConnection("background", (message) => {
  try {
    port.postMessage(message);
  } catch (error) {
    devtools.removeConnection("background");
  }
});

// In case we can't connect to the tab, we should at least show something to the
// user when we've attempted to connect 3 times.
function startConnectTimeout(attempts = 0) {
  connectTimeoutId = setTimeout(() => {
    if (attempts < 3) {
      sendMessageToClient(CONNECT_TO_CLIENT);
      startConnectTimeout(attempts + 1);
    } else {
      devtoolsMachine.send({ type: "timeout" });
    }
    // Pick a threshold above the time it takes to determine if the client is
    // found on the page. This ensures we don't reset that counter and provide a
    // proper "not found" message.
  }, 11_000);
}

devtools.listen(CONNECT_TO_DEVTOOLS, (event) => {
  devtoolsMachine.send({
    type: "connect",
    context: {
      clientContext: JSON.parse(event.payload ?? "") as {
        queries: QueryInfo[];
        mutations: QueryInfo[];
        cache: Record<string, JSONObject>;
      },
    },
  });
});

devtools.listen(CONNECT_TO_CLIENT_TIMEOUT, () => {
  devtoolsMachine.send({ type: "timeout" });
});

devtools.listen(DISCONNECT_FROM_DEVTOOLS, () => {
  devtoolsMachine.send({ type: "disconnect" });
});

devtools.listen(CLIENT_NOT_FOUND, () => {
  clearTimeout(connectTimeoutId);
  devtoolsMachine.send({ type: "clientNotFound" });
});

devtoolsMachine.onTransition("connecting", () => {
  sendMessageToClient(CONNECT_TO_CLIENT);
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

sendMessageToClient(CONNECT_TO_CLIENT);

function sendMessageToClient(message: string) {
  devtools.send({
    message,
    to: `background:tab-${inspectedTabId}:client`,
    payload: undefined,
  });
}

function startRequestInterval(ms = 500) {
  let id: NodeJS.Timeout;

  if (devtoolsMachine.matches("connected")) {
    sendMessageToClient(REQUEST_DATA);
    id = setInterval(sendMessageToClient, ms, REQUEST_DATA);
  }

  return () => clearInterval(id);
}

devtools.addConnection(EXPLORER_SUBSCRIPTION_TERMINATION, () => {
  sendMessageToClient(EXPLORER_SUBSCRIPTION_TERMINATION);
});

const unsubscribers = new Set<() => void>();

function unsubscribeFromAll() {
  unsubscribers.forEach((unsubscribe) => unsubscribe());
  unsubscribers.clear();
}

let connectedToPanel = false;

async function createDevtoolsPanel() {
  const panel = await browser.devtools.panels.create(
    "Apollo",
    "",
    "panel.html"
  );

  let removeUpdateListener: () => void;
  let removeExplorerForward: () => void;
  let removeSubscriptionTerminationListener: () => void;
  let removeReloadListener: () => void;
  let removeExplorerListener: () => void;

  panel.onShown.addListener((window) => {
    if (!connectedToPanel) {
      const state = devtoolsMachine.getState();

      window.postMessage({
        type: INITIALIZE_PANEL,
        state: state.value,
        payload: state.context.clientContext,
      });

      window.addEventListener("message", (event) => {
        switch (event.data.type) {
          case RETRY_CONNECTION:
            return devtoolsMachine.send({ type: "retry" });
        }
      });

      devtoolsMachine.subscribe(({ state }) => {
        window.postMessage({
          type: DEVTOOLS_STATE_CHANGED,
          state: state.value,
        });
      });

      connectedToPanel = true;
    }

    if (devtoolsMachine.matches("initialized")) {
      sendMessageToClient(CONNECT_TO_CLIENT);
      startConnectTimeout();
    }

    if (devtoolsMachine.matches("connected") && panelHidden) {
      unsubscribers.add(startRequestInterval());
    }

    const {
      __DEVTOOLS_APPLICATION__: {
        receiveExplorerRequests,
        receiveSubscriptionTerminationRequest,
        sendResponseToExplorer,
      },
    } = window;

    removeUpdateListener = devtools.listen<string>(UPDATE, ({ payload }) => {
      const { queries, mutations, cache } = JSON.parse(payload ?? "") as {
        queries: QueryInfo[];
        mutations: QueryInfo[];
        cache: Record<string, JSONObject>;
      };

      window.postMessage({
        type: UPDATE,
        payload: {
          queries,
          mutations,
          cache: JSON.stringify(cache),
        },
      });
    });

    // Add connection so client can send to `background:devtools-${inspectedTabId}:explorer`
    devtools.addConnection("explorer", sendResponseToExplorer);
    removeExplorerListener = receiveExplorerRequests(({ detail }) => {
      devtools.broadcast(detail);
    });

    removeSubscriptionTerminationListener =
      receiveSubscriptionTerminationRequest(({ detail }) => {
        devtools.broadcast(detail);
      });

    // Forward all Explorer requests to the client
    removeExplorerForward = devtools.forward(
      EXPLORER_REQUEST,
      `background:tab-${inspectedTabId}:client`
    );

    panelHidden = false;
  });

  panel.onHidden.addListener(() => {
    panelHidden = true;
    unsubscribeFromAll();

    removeExplorerForward();
    removeSubscriptionTerminationListener();
    removeUpdateListener();
    removeReloadListener();
    removeExplorerListener();
    devtools.removeConnection("explorer");
  });
}

createDevtoolsPanel();
