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
import { RELOADING_TAB, RELOAD_TAB_COMPLETE, UPDATE } from "../constants";
import "./panel.css";

declare global {
  interface Window {
    __DEVTOOLS_APPLICATION__: {
      receiveExplorerRequests: typeof receiveExplorerRequests;
      receiveSubscriptionTerminationRequest: typeof receiveSubscriptionTerminationRequest;
      sendResponseToExplorer: typeof sendResponseToExplorer;
    };
  }
}

window.__DEVTOOLS_APPLICATION__ = {
  receiveExplorerRequests,
  receiveSubscriptionTerminationRequest,
  sendResponseToExplorer,
};

window.addEventListener("message", (event) => {
  switch (event.data.type) {
    case RELOADING_TAB:
      return handleReload();
    case RELOAD_TAB_COMPLETE:
      return handleReloadComplete();
    case UPDATE:
      return writeData(event.data.payload);
  }

  if (event.data.type === "STATE_CHANGE") {
    console.log("panel.ts", event.data);
  }
});

initDevTools();
