// This script is injected into each tab.
import browser from "webextension-polyfill";
import {
  createMessageBridge,
  createMessagePortMessageAdapter,
  createPortMessageAdapter,
} from "../messageAdapters";
import { connectTab } from "./controlChannel";
import { Actor, createActor } from "../actor";
import { RPC, createRpcHandler } from "../rpc";
import type { DevtoolsMessage } from "../messages";

const portAdapter = createPortMessageAdapter(() =>
  browser.runtime.connect({ name: "tab" })
);

const forwardRpc = RPC.createFilter({ excludeTypes: ["connectClient"] });
const forwardActor = Actor.createFilter({
  excludeTypes: ["disconnectClient", "clientReady"],
});

function shouldForward(message: DevtoolsMessage) {
  return forwardRpc(message) && forwardActor(message);
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
