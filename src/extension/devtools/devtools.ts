import browser from "webextension-polyfill";
import type { Actor } from "../actor";
import { getPanelActor } from "./panelActor";
import {
  createMessageBridge,
  createPortMessageAdapter,
  createWindowMessageAdapter,
} from "../messageAdapters";

const inspectedTabId = chrome.devtools.inspectedWindow.tabId;

let connectedToPanel = false;
let panelWindow: Actor;

chrome.devtools.panels.create("Apollo", "", "panel.html", (panel) => {
  panel.onShown.addListener((window) => {
    panelWindow = getPanelActor(window);

    const portAdapter = createPortMessageAdapter(
      () => browser.runtime.connect({ name: inspectedTabId.toString() }),
      {
        onExtensionInvalidated: () => {
          panelWindow.send({ type: "extensionInvalidated" });
        },
      }
    );

    if (connectedToPanel) {
      panelWindow.send({ type: "panelShown" });
    } else {
      createMessageBridge(createWindowMessageAdapter(window), portAdapter);

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
