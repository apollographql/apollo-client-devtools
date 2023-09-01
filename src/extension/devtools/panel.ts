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

declare global {
  interface Window {
    __DEVTOOLS_APPLICATION__: {
      initialize: typeof initDevTools;
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
  initialize: initDevTools,
  writeData,
  receiveExplorerRequests,
  receiveSubscriptionTerminationRequest,
  sendResponseToExplorer,
  handleReload,
  handleReloadComplete,
};
