// This script is injected into each tab.
import browser from "webextension-polyfill";
import {
  createMessageBridge,
  createMessagePortMessageAdapter,
  createPortMessageAdapter,
} from "../messageAdapters";
import { connectClient, connectTab } from "./controlChannel";

connectTab(window, (port) => {
  const portAdapter = createPortMessageAdapter(() =>
    browser.runtime.connect({ name: "tab" })
  );

  createMessageBridge(portAdapter, createMessagePortMessageAdapter(port));
});

connectClient(window, (port, clientId) => {
  const portAdapter = createPortMessageAdapter(() =>
    browser.runtime.connect({ name: `client:${clientId}` })
  );

  createMessageBridge(portAdapter, createMessagePortMessageAdapter(port));
});
