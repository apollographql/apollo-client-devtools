import { initDevTools, writeData, client } from "../../application";
import {
  receiveExplorerRequests,
  receiveSubscriptionTerminationRequest,
  sendResponseToExplorer,
} from "../../application/components/Explorer/explorerRelay";
import { UPDATE } from "../constants";
import "./panel.css";
import { devtoolsState } from "../../application/App";

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
    case UPDATE:
      return writeData(event.data.payload);
  }

  if (event.data.type === "STATE_CHANGE") {
    devtoolsState(event.data.state);

    if (event.data.state === "connected") {
      client.resetStore();
    }
  }
});

initDevTools();
