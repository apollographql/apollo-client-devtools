import browser from "webextension-polyfill";
import { createDevtoolsMachine } from "../../application/machines";
import type { Actor } from "../actor";
import { createActor } from "../actor";
import type { ClientMessage, PanelMessage } from "../messages";
import { getPanelActor } from "./panelActor";
import {
  createPortMessageAdapter,
  createWindowMessageAdapter,
} from "../messageAdapters";
import { createRPCBridge } from "../rpc";
import { interpret } from "@xstate/fsm";

const inspectedTabId = browser.devtools.inspectedWindow.tabId;

const devtoolsMachine = interpret(
  createDevtoolsMachine({
    actions: {
      connectToClient,
    },
  })
).start();

let connectTimeoutId: NodeJS.Timeout;

const portAdapter = createPortMessageAdapter(() =>
  browser.runtime.connect({ name: inspectedTabId.toString() })
);

const clientPort = createActor<ClientMessage>(portAdapter);

function connectToClient() {
  clientPort.send({ type: "connectToClient" });
  startConnectTimeout();
}

function disconnectFromDevtools() {
  devtoolsMachine.send("disconnect");
  startConnectTimeout();
}

function startConnectTimeout() {
  clearTimeout(connectTimeoutId);

  connectTimeoutId = setTimeout(() => {
    devtoolsMachine.send("clientNotFound");
  }, 10_000);
}

clientPort.on("connectToDevtools", () => {
  devtoolsMachine.send({ type: "connect" });
});

clientPort.on("registerClient", () => {
  devtoolsMachine.send({ type: "connect" });
});

clientPort.on("clientTerminated", disconnectFromDevtools);

connectToClient();

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

    if (!connectedToPanel) {
      createRPCBridge(createWindowMessageAdapter(window), portAdapter);

      panelWindow.send({
        type: "initializePanel",
        state: devtoolsMachine.state.value,
      });

      panelWindow.on("retryConnection", () => {
        devtoolsMachine.send("retry");
      });

      devtoolsMachine.subscribe(({ value }) => {
        panelWindow.send({ type: "devtoolsStateChanged", state: value });
      });

      clientPort.forward("explorerResponse", panelWindow);
      panelWindow.forward("explorerRequest", clientPort);
      panelWindow.forward("explorerSubscriptionTermination", clientPort);
      clientPort.forward("registerClient", panelWindow);
      clientPort.forward("clientTerminated", panelWindow);

      connectedToPanel = true;
    }
  });
}

createDevtoolsPanel();

browser.devtools.network.onNavigated.addListener(disconnectFromDevtools);
