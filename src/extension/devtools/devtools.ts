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
} from "../constants";
import browser from "webextension-polyfill";
import { QueryInfo } from "../tab/helpers";
import { JSONObject } from "../../application/types/json";

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
    console.log("onShown");
    sendMessageToClient(DEVTOOLS_INITIALIZED);

    devtools.listen(CONNECT_TO_DEVTOOLS, () => {
      clearRequestInterval = startRequestInterval();
    });

    devtools.listen(CONNECT_TO_CLIENT_TIMEOUT, () => {
      console.log("timeout");
    });

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
