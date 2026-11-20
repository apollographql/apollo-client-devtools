// This script is injected into each tab.
import browser from "webextension-polyfill";
import {
  createMessageBridge,
  createMessagePortMessageAdapter,
  createPortMessageAdapter,
} from "../messageAdapters";
import { connectTab } from "./controlChannel";
import { createActor } from "../actor";
import { createRpcHandler } from "../rpc";
import { MessageType, type DevtoolsMessage } from "../messages";

const portAdapter = createPortMessageAdapter(() =>
  browser.runtime.connect({ name: "tab" })
);

function shouldForward(message: DevtoolsMessage) {
  return (
    !(
      message.type === MessageType.RPCRequest &&
      message.name === "connectClient"
    ) &&
    !(
      message.type === MessageType.Actor &&
      (message.message.type === "disconnectClient" ||
        message.message.type === "clientReady")
    )
  );
}

connectTab(window, (port) => {
  const frameAdapter = createMessagePortMessageAdapter(port);
  createMessageBridge(portAdapter, frameAdapter, shouldForward);
  createRpcHandler(frameAdapter)("connectClient", () => {
    const { port1: clientPort, port2 } = new MessageChannel();
    const abort = new AbortController();
    const clientAdapter = createMessagePortMessageAdapter(clientPort);
    const clientActor = createActor(clientAdapter);
    // A client may stop before the hook receives the transferred endpoint.
    const removeReadyListener = clientActor.on("clientReady", () => {
      removeReadyListener();
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
      function close() {
        disconnect();
        abort.abort();
        clientPort.close();
      }
      clientActor.on("disconnectClient", close, { signal: abort.signal });
      clientPort.addEventListener("close", close, { signal: abort.signal });
    });
    return port2;
  });
});
