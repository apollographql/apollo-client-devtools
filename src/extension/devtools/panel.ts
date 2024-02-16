import { initDevTools, writeData, client } from "../../application";
import {
  receiveExplorerRequests,
  receiveSubscriptionTerminationRequest,
  sendResponseToExplorer,
} from "../../application/components/Explorer/explorerRelay";
import "./panel.css";
import { devtoolsState } from "../../application/App";
import { createWindowActor } from "../actor";
import { PanelMessage } from "../messages";

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

const actor = createWindowActor<PanelMessage>(window);

actor.on("initializePanel", (message) => {
  devtoolsState(message.state);
  writeData(message.payload);

  initDevTools();
});

actor.on("devtoolsStateChanged", (message) => {
  devtoolsState(message.state);

  if (message.state === "connected") {
    client.resetStore();
  }
});

actor.on("update", (message) => {
  writeData(message.payload);
});
