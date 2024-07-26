import browser from "webextension-polyfill";
import type { Actor } from "../actor";
import { createActor } from "../actor";
import type { ClientMessage, PanelMessage } from "../messages";
import { getPanelActor } from "./panelActor";
import {
  createPortMessageAdapter,
  createWindowMessageAdapter,
} from "../messageAdapters";
import { createRPCBridge } from "../rpc";

const inspectedTabId = browser.devtools.inspectedWindow.tabId;

const portAdapter = createPortMessageAdapter(() =>
  browser.runtime.connect({ name: inspectedTabId.toString() })
);

const clientPort = createActor<ClientMessage>(portAdapter);

let connectedToPanel = false;
let panelWindow: Actor<PanelMessage>;

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
      createRPCBridge(createWindowMessageAdapter(window), portAdapter);

      clientPort.forward("explorerResponse", panelWindow);
      clientPort.forward("registerClient", panelWindow);
      clientPort.forward("clientTerminated", panelWindow);
      clientPort.forward("connectToDevtools", panelWindow);

      panelWindow.forward("explorerRequest", clientPort);
      panelWindow.forward("explorerSubscriptionTermination", clientPort);

      panelWindow.send({ type: "initializePanel" });

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
