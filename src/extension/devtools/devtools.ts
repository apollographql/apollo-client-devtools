import Relay from "../../Relay";
import {
  DEVTOOLS_INITIALIZED,
  CREATE_DEVTOOLS_PANEL,
  REQUEST_DATA,
  UPDATE,
  PANEL_OPEN,
  PANEL_CLOSED,
  EXPLORER_REQUEST,
  RELOADING_TAB,
  RELOAD_TAB_COMPLETE,
} from "../constants";

const inspectedTabId = chrome.devtools.inspectedWindow.tabId;
const devtools = new Relay();

const port = chrome.runtime.connect({
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

function sendMessageToClient(message: any) {
  devtools.send({
    message,
    to: `background:tab-${inspectedTabId}:client`,
  });
}

function startRequestInterval(ms = 500) {
  sendMessageToClient(REQUEST_DATA);
  const id = setInterval(sendMessageToClient, ms, REQUEST_DATA);
  return () => clearInterval(id);
}

sendMessageToClient(DEVTOOLS_INITIALIZED);

let isPanelCreated = false;
let isAppInitialized = false;

devtools.listen(CREATE_DEVTOOLS_PANEL, ({ payload }) => {
  if (!isPanelCreated) {
    chrome.devtools.panels.create(
      "Apollo",
      "logo_devtools.png",
      "panel.html",
      function (panel) {
        isPanelCreated = true;
        const { queries, mutations, cache } = JSON.parse(payload);
        let removeUpdateListener;
        let removeExplorerForward;
        let removeReloadListener;
        let clearRequestInterval;
        let removeExplorerListener;

        panel.onShown.addListener((window) => {
          sendMessageToClient(PANEL_OPEN);

          const {
            __DEVTOOLS_APPLICATION__: {
              initialize,
              writeData,
              receiveExplorerRequests,
              sendResponseToExplorer,
              handleReload,
              handleReloadComplete,
            },
          } = window as any;

          if (!isAppInitialized) {
            initialize();
            writeData({ queries, mutations, cache: JSON.stringify(cache) });
            isAppInitialized = true;
          }

          clearRequestInterval = startRequestInterval();

          removeUpdateListener = devtools.listen(UPDATE, ({ payload }) => {
            const { queries, mutations, cache } = JSON.parse(payload);
            writeData({ queries, mutations, cache: JSON.stringify(cache) });
          });

          // Add connection so client can send to `background:devtools-${inspectedTabId}:graphiql`
          devtools.addConnection("graphiql", sendResponseToExplorer);
          removeExplorerListener = receiveExplorerRequests(({ detail }) => {
            devtools.broadcast(detail);
          });

          // Forward all Explorer requests to the client
          removeExplorerForward = devtools.forward(
            EXPLORER_REQUEST,
            `background:tab-${inspectedTabId}:client`
          );

          // Listen for tab reload from background
          removeReloadListener = devtools.listen(RELOADING_TAB, () => {
            handleReload();
            clearRequestInterval();

            const removeListener = devtools.listen(RELOAD_TAB_COMPLETE, () => {
              clearRequestInterval = startRequestInterval();
              handleReloadComplete();
              removeListener();
            });
          });
        });

        panel.onHidden.addListener(() => {
          isPanelCreated = false;
          clearRequestInterval();
          removeExplorerForward();
          removeUpdateListener();
          removeReloadListener();
          removeExplorerListener();
          devtools.removeConnection("graphiql");
          sendMessageToClient(PANEL_CLOSED);
        });
      }
    );
  }
});
