// This script is injected into each tab.
import browser from "webextension-polyfill";
import {
  createMessageBridge,
  createMessagePortMessageAdapter,
  createPortMessageAdapter,
} from "../messageAdapters";
import { connectClient, connectTab } from "./controlChannel";

connectTab(window, (port) => {
  createMessageBridge(
    createPortMessageAdapter(() => browser.runtime.connect({ name: "tab" })),
    createMessagePortMessageAdapter(port)
  );
});

connectClient(window, (port, clientId) => {
  createMessageBridge(
    createPortMessageAdapter(() =>
      browser.runtime.connect({ name: `client:${clientId}` })
    ),
    createMessagePortMessageAdapter(port)
  );
});
