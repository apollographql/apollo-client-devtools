import { initDevTools, client, removeClient } from "../../application";
import "./panel.css";
import { devtoolsState } from "../../application/App";
import { getPanelActor } from "./panelActor";

const panelWindow = getPanelActor(window);

panelWindow.on("initializePanel", (message) => {
  devtoolsState(message.state);

  initDevTools();
});

panelWindow.on("devtoolsStateChanged", (message) => {
  devtoolsState(message.state);

  if (message.state !== "connected") {
    client.resetStore();
  }
});

panelWindow.on("clientTerminated", (message) => {
  removeClient(message.clientId);
});
