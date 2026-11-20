// This script is injected into each tab.
import browser from "webextension-polyfill";
import {
  createMessageBridge,
  createMessagePortMessageAdapter,
  createPortMessageAdapter,
} from "../messageAdapters";
import { connectTab } from "./controlChannel";
import { createActor } from "../actor";
import { MessageType, type DevtoolsMessage } from "../messages";

const portAdapter = createPortMessageAdapter(() =>
  browser.runtime.connect({ name: "tab" })
);

function shouldForward(message: DevtoolsMessage) {
  return (
    message.type !== MessageType.Actor ||
    (message.message.type !== "connectClient" &&
      message.message.type !== "disconnectClient")
  );
}

connectTab(window, (port) => {
  const frameAdapter = createMessagePortMessageAdapter(port);
  createMessageBridge(portAdapter, frameAdapter, shouldForward);
  createActor(frameAdapter).on("connectClient", ({ port: clientPort }) => {
    const abort = new AbortController();
    const clientAdapter = createMessagePortMessageAdapter(clientPort);
    const clientActor = createActor(clientAdapter);
    const runtime = createPortMessageAdapter(
      () => browser.runtime.connect({ name: "client" }),
      {
        signal: abort.signal,
        onDisconnect: () => {
          clientActor.send({ type: "devtoolsDisconnected" });
          clientActor.send({ type: "explorerSubscriptionTermination" });
        },
      }
    );
    const disconnect = createMessageBridge(
      runtime,
      clientAdapter,
      shouldForward
    );
    clientActor.on(
      "disconnectClient",
      () => {
        disconnect();
        abort.abort();
        clientPort.close();
      },
      { signal: abort.signal }
    );
  });
});
