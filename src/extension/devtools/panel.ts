import { initDevTools, writeData, client, addClient } from "../../application";
import "./panel.css";
import { devtoolsState } from "../../application/App";
import { getPanelActor } from "./panelActor";

const panelWindow = getPanelActor(window);

panelWindow.on("initializePanel", (message) => {
  devtoolsState(message.state);
  writeData(message.payload);

  initDevTools();
});

panelWindow.on("devtoolsStateChanged", (message) => {
  devtoolsState(message.state);

  if (message.state !== "connected") {
    client.resetStore();
  }
});

panelWindow.on("update", (message) => {
  writeData(message.payload);
});

panelWindow.on("registerClient", (message) => {
  addClient(message.payload);
});
