import {
  initDevTools,
  writeData,
  handleReload,
  handleReloadComplete,
} from "../../application";
import {
  receiveExplorerRequests,
  receiveSubscriptionTerminationRequest,
  sendResponseToExplorer,
} from "../../application/components/Explorer/explorerRelay";
import { RELOADING_TAB, RELOAD_TAB_COMPLETE } from "../constants";
import "./panel.css";

declare global {
  interface Window {
    __DEVTOOLS_APPLICATION__: {
      writeData: typeof writeData;
      receiveExplorerRequests: typeof receiveExplorerRequests;
      receiveSubscriptionTerminationRequest: typeof receiveSubscriptionTerminationRequest;
      sendResponseToExplorer: typeof sendResponseToExplorer;
      handleReload: typeof handleReload;
      handleReloadComplete: typeof handleReloadComplete;
    };
  }
}

window.__DEVTOOLS_APPLICATION__ = {
  writeData,
  receiveExplorerRequests,
  receiveSubscriptionTerminationRequest,
  sendResponseToExplorer,
  handleReload,
  handleReloadComplete,
};

window.addEventListener("message", (event) => {
  switch (event.data.type) {
    case RELOADING_TAB:
      return handleReload();
    case RELOAD_TAB_COMPLETE:
      return handleReloadComplete();
  }
});

initDevTools();
