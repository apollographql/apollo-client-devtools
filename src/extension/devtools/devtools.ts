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
import { createActor as createMachineActor } from "xstate";
import { devtoolsMachine } from "../../application/machines";

const inspectedTabId = browser.devtools.inspectedWindow.tabId;

const machine = createMachineActor(
  devtoolsMachine.provide({
    actions: {
      connectToClient: () => {},
    },
  })
).start();

// let connectTimeoutId: NodeJS.Timeout;

const portAdapter = createPortMessageAdapter(() =>
  browser.runtime.connect({ name: inspectedTabId.toString() })
);

const clientPort = createActor<ClientMessage>(portAdapter);

// function connectToClient() {
//   clientPort.send({ type: "connectToClient" });
//   startConnectTimeout();
// }

// function disconnectFromDevtools() {
//   machine.send({ type: "disconnect" });
//   startConnectTimeout();
// }

// function startConnectTimeout() {
//   clearTimeout(connectTimeoutId);
//
//   connectTimeoutId = setTimeout(() => {
//     machine.send({ type: "clientNotFound" });
//   }, 10_000);
// }

// clientPort.on("connectToDevtools", () => {
//   machine.send({ type: "connect" });
// });
//
// clientPort.on("registerClient", () => {
//   machine.send({ type: "connect" });
// });

// clientPort.on("clientTerminated", disconnectFromDevtools);

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
        state: machine.getSnapshot().value as any,
      });

      // panelWindow.on("retryConnection", () => {
      //   machine.send({ type: "retry" });
      // });

      // machine.subscribe(({ value }) => {
      //   panelWindow.send({ type: "devtoolsStateChanged", state: value as any });
      // });

      clientPort.forward("explorerResponse", panelWindow);
      clientPort.forward("registerClient", panelWindow);
      clientPort.forward("clientTerminated", panelWindow);
      clientPort.forward("connectToDevtools", panelWindow);

      panelWindow.forward("connectToClient", clientPort);
      panelWindow.forward("explorerRequest", clientPort);
      panelWindow.forward("explorerSubscriptionTermination", clientPort);

      connectedToPanel = true;
    }
  });
}

createDevtoolsPanel();

// browser.devtools.network.onNavigated.addListener(disconnectFromDevtools);
