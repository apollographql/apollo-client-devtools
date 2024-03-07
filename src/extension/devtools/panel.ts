import {
  initDevTools,
  writeData,
  client,
  registerReactiveVar,
  updateReactiveVar,
} from "../../application";
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

  if (message.state === "connected") {
    client.resetStore();
  }
});

panelWindow.on("update", (message) => {
  writeData(message.payload);
});

panelWindow.on("reactiveVar.register", ({ payload }) => {
  registerReactiveVar({
    id: payload.id,
    displayName: payload.displayName,
    value: payload.initialValue,
  });
});

panelWindow.on("reactiveVar.update", ({ payload }) => {
  updateReactiveVar(payload.id, payload.value);
});
