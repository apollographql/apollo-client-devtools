import browser from "webextension-polyfill";
import type { Actor } from "../actor";
import { createActor } from "../actor";
import type { PanelWindow } from "./panelTransport";
import {
  createMessageBridge,
  createPortMessageAdapter,
  createMessagePortMessageAdapter,
} from "../messageAdapters";

const inspectedTabId = chrome.devtools.inspectedWindow.tabId;

const portAdapter = createPortMessageAdapter(() =>
  browser.runtime.connect({ name: inspectedTabId.toString() })
);

let connectedToPanel = false;
let panelWindow: Actor;

chrome.devtools.panels.create("Apollo", "", "panel.html", (panel) => {
  panel.onShown.addListener((window) => {
    if (connectedToPanel) {
      panelWindow.send({ type: "panelShown" });
    } else {
      const panelAdapter = createMessagePortMessageAdapter(
        (window as PanelWindow).connectApolloPanel()
      );
      panelWindow = createActor(panelAdapter);
      createMessageBridge(panelAdapter, portAdapter);

      panelWindow.send({ type: "initializePanel", initialContext: {} });

      connectedToPanel = true;
    }
  });

  panel.onHidden.addListener(() => {
    panelWindow.send({ type: "panelHidden" });
  });
});

chrome.devtools.network.onNavigated.addListener(() => {
  panelWindow?.send({ type: "pageNavigated" });
});
