import Relay from "../../Relay";
import {
  REQUEST_TAB_ID,
  EXPLORER_RESPONSE,
  UPDATE,
  CONNECT_TO_DEVTOOLS,
  CONNECT_TO_CLIENT_TIMEOUT,
  DISCONNECT_FROM_DEVTOOLS,
} from "../constants";
import browser from "webextension-polyfill";

// Inspected tabs are unable to retrieve their own ids.
// This requests the tab's id from the background script.
// Once it resolves, we can create the tab's Relay.
function requestId() {
  return browser.runtime.sendMessage({ message: REQUEST_TAB_ID });
}

// eslint-disable-next-line no-async-promise-executor
export default new Promise(async ($export) => {
  const id = await requestId();
  const tab = new Relay();
  const port = browser.runtime.connect({
    name: `tab-${id}`,
  });

  console.log("tabId", id);

  tab.addConnection("background", (message) => {
    port.postMessage(message);
  });

  port.onMessage.addListener(tab.broadcast);

  window.addEventListener("message", (event) => {
    tab.broadcast(event?.data);
  });

  tab.addConnection("client", (message) => {
    window.postMessage(message, "*");
  });

  const devtools = `background:devtools-${id}`;
  tab.forward(UPDATE, devtools);
  tab.forward(CONNECT_TO_DEVTOOLS, devtools);
  tab.forward(CONNECT_TO_CLIENT_TIMEOUT, devtools);
  tab.forward(DISCONNECT_FROM_DEVTOOLS, devtools);
  tab.forward(EXPLORER_RESPONSE, `${devtools}:explorer`);

  const module = await Promise.resolve({ tab, id });
  $export(module);
});
