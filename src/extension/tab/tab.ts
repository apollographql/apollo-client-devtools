// This script is injected into each tab.
import browser from "webextension-polyfill";
import {
  createMessageBridge,
  createMessagePortMessageAdapter,
  createPortMessageAdapter,
} from "../messageAdapters";
import { connectTab } from "./controlChannel";

const portAdapter = createPortMessageAdapter(() =>
  browser.runtime.connect({ name: "tab" })
);

connectTab(window, (port) => {
  createMessageBridge(portAdapter, createMessagePortMessageAdapter(port));
});
