import { initDevTools, writeData, client } from "../../application";
import {
  receiveExplorerRequests,
  receiveSubscriptionTerminationRequest,
  sendResponseToExplorer,
} from "../../application/components/Explorer/explorerRelay";
import "./panel.css";
import { devtoolsState } from "../../application/App";
import { getPanelActor } from "./panelActor";

const actor = getPanelActor(window);

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

actor.on("explorerResponse", sendResponseToExplorer);

receiveExplorerRequests(({ detail }) => {
  actor.send({ type: "explorerRequest", payload: detail.payload });
});

receiveSubscriptionTerminationRequest(() => {
  actor.send({ type: "explorerSubscriptionTermination" });
});
