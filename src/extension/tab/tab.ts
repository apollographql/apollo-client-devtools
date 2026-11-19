// This script is injected into each tab.
import browser from "webextension-polyfill";
import {
  createMessageBridge,
  createMessagePortMessageAdapter,
  createPortMessageAdapter,
} from "../messageAdapters";
import { connectTab } from "./controlChannel";

connectTab(window, (port) => {
  const portAdapter = createPortMessageAdapter(() =>
    browser.runtime.connect({ name: "tab" })
  );

  createMessageBridge(portAdapter, createMessagePortMessageAdapter(port));
});
