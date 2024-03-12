import { initDevTools, writeData, client } from "../../application";
import "./panel.css";
import { devtoolsState } from "../../application/App";
import { getPanelActor } from "./panelActor";
import type { QueryInfo } from "../tab/helpers";
import type { JSONObject } from "../../application/types/json";

const panelWindow = getPanelActor(window);

function parseClientData(payload: string) {
  return JSON.parse(payload) as {
    queries: QueryInfo[];
    mutations: QueryInfo[];
    cache: JSONObject;
  };
}

panelWindow.on("initializePanel", (message) => {
  devtoolsState(message.state);
  writeData(parseClientData(message.payload));

  initDevTools();
});

panelWindow.on("devtoolsStateChanged", (message) => {
  devtoolsState(message.state);

  if (message.state === "connected") {
    client.resetStore();
  }
});

panelWindow.on("update", (message) => {
  writeData(parseClientData(message.payload));
});
