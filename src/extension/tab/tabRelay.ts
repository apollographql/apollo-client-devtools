import Relay from "../../Relay";
import {
  CLIENT_FOUND,
  REQUEST_TAB_ID,
  CREATE_DEVTOOLS_PANEL,
  ACTION_HOOK_FIRED,
  EXPLORER_RESPONSE,
  UPDATE,
  RELOADING_TAB,
  RELOAD_TAB_COMPLETE,
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
  tab.forward(CLIENT_FOUND, devtools);
  tab.forward(CREATE_DEVTOOLS_PANEL, devtools);
  tab.forward(ACTION_HOOK_FIRED, devtools);
  tab.forward(UPDATE, devtools);
  tab.forward(RELOADING_TAB, devtools);
  tab.forward(RELOAD_TAB_COMPLETE, devtools);
  tab.forward(EXPLORER_RESPONSE, `${devtools}:explorer`);

  const module = await Promise.resolve({ tab, id });
  $export(module);
});
