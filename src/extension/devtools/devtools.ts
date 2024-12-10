import browser from "webextension-polyfill";
import type { Actor } from "../actor";
import { getPanelActor } from "./panelActor";
import {
  createMessageBridge,
  createPortMessageAdapter,
  createWindowMessageAdapter,
} from "../messageAdapters";

const inspectedTabId = browser.devtools.inspectedWindow.tabId;

const portAdapter = createPortMessageAdapter(() =>
  browser.runtime.connect({ name: inspectedTabId.toString() })
);

let connectedToPanel = false;
let panelWindow: Actor;

async function createDevtoolsPanel() {
  const panel = await browser.devtools.panels.create(
    "Apollo",
    "",
    "panel.html"
  );

  panel.onShown.addListener((window) => {
    panelWindow = getPanelActor(window);

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
}

createDevtoolsPanel();

browser.devtools.network.onNavigated.addListener(() => {
  panelWindow?.send({ type: "pageNavigated" });
});
