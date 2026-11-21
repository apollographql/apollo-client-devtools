// This script is injected into each tab.
import browser from "webextension-polyfill";
import {
  createMessageBridge,
  createMessagePortMessageAdapter,
  createPortMessageAdapter,
} from "../messageAdapters";
import {
  connectClientMessagePort,
  connectTabMessagePort,
} from "./controlChannel";

connectTabMessagePort(window, (port) => {
  createMessageBridge(
    createPortMessageAdapter(() => browser.runtime.connect({ name: "tab" })),
    createMessagePortMessageAdapter(port)
  );
});

connectClientMessagePort(window, (port, clientId) => {
  const portAdapter = createPortMessageAdapter(() =>
    browser.runtime.connect({ name: `client:${clientId}` })
  );
  const messagePortAdapter = createMessagePortMessageAdapter(port);

  messagePortAdapter.onDisconnect(() => portAdapter.disconnect());
  createMessageBridge(portAdapter, messagePortAdapter);
});
