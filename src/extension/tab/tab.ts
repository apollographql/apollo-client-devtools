// This script is injected into each tab.
import browser from "webextension-polyfill";
import {
  createMessageBridge,
  createPortMessageAdapter,
  createWindowMessageAdapter,
} from "../messageAdapters";

const portAdapter = createPortMessageAdapter(() =>
  browser.runtime.connect({ name: "tab" })
);

createMessageBridge(portAdapter, createWindowMessageAdapter(window));
