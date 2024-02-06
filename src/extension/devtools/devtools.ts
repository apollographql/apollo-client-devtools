import { EXPLORER_SUBSCRIPTION_TERMINATION } from "../../application/components/Explorer/postMessageHelpers";
import Relay from "../../Relay";
import {
  DEVTOOLS_INITIALIZED,
  REQUEST_DATA,
  UPDATE,
  EXPLORER_REQUEST,
  RELOADING_TAB,
  RELOAD_TAB_COMPLETE,
  CONNECT_TO_DEVTOOLS,
  CONNECT_TO_CLIENT_TIMEOUT,
  DISCONNECT_FROM_DEVTOOLS,
} from "../constants";
import browser from "webextension-polyfill";
import { QueryInfo } from "../tab/helpers";
import { JSONObject } from "../../application/types/json";
import { devtoolsMachine } from "../../application/machines";

const inspectedTabId = browser.devtools.inspectedWindow.tabId;
const devtools = new Relay();

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

devtools.listen(CONNECT_TO_DEVTOOLS, () => {
  devtoolsMachine.send({ type: "connect" });
});

devtools.listen(CONNECT_TO_CLIENT_TIMEOUT, () => {
  devtoolsMachine.send({ type: "timeout" });
});

devtools.listen(DISCONNECT_FROM_DEVTOOLS, () => {
  devtoolsMachine.send({ type: "disconnect" });
});

sendMessageToClient(DEVTOOLS_INITIALIZED);

function sendMessageToClient(message: string) {
  devtools.send({
    message,
    to: `background:tab-${inspectedTabId}:client`,
    payload: undefined,
  });
}

function startRequestInterval(ms = 500) {
  sendMessageToClient(REQUEST_DATA);
  const id = setInterval(sendMessageToClient, ms, REQUEST_DATA);
  return () => clearInterval(id);
}

devtools.addConnection(EXPLORER_SUBSCRIPTION_TERMINATION, () => {
  sendMessageToClient(EXPLORER_SUBSCRIPTION_TERMINATION);
});

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
  let clearRequestInterval: () => void;
  let removeExplorerListener: () => void;

  panel.onShown.addListener((window) => {
    const state = devtoolsMachine.getState();

    if (!connectedToPanel) {
      // Send the current state since subscribe does not immediately send a
      // value. This will sync the panel with the current state of the devtools.
      window.postMessage({
        type: "STATE_CHANGE",
        state: devtoolsMachine.getState().value,
      });

      devtoolsMachine.subscribe((state) => {
        window.postMessage({ type: "STATE_CHANGE", state: state.value });
      });

      connectedToPanel = true;
    }

    if (state.value === "initialized") {
      sendMessageToClient(DEVTOOLS_INITIALIZED);
      const unsubscribe = devtoolsMachine.onTransition("connected", () => {
        console.log("connected");
        unsubscribe();
      });
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
    //
    // // Listen for tab reload from background
    removeReloadListener = devtools.listen(RELOADING_TAB, () => {
      window.postMessage({ type: RELOADING_TAB });
      clearRequestInterval();
      const removeListener = devtools.listen(RELOAD_TAB_COMPLETE, () => {
        window.postMessage({ type: RELOAD_TAB_COMPLETE });
        clearRequestInterval = startRequestInterval();
        removeListener();
      });
    });
  });

  panel.onHidden.addListener(() => {
    // unsubscriptions.forEach((unsubscribe) => unsubscribe());

    clearRequestInterval();
    removeExplorerForward();
    removeSubscriptionTerminationListener();
    removeUpdateListener();
    removeReloadListener();
    removeExplorerListener();
    devtools.removeConnection("explorer");
  });
}

createDevtoolsPanel();
