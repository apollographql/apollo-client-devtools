import Relay from "../../Relay";
import { REQUEST_TAB_ID } from "../constants";
import browser from "webextension-polyfill";

const ports = new Map<number, browser.Runtime.Port>();

// This sends the tab id to the inspected tab.
browser.runtime.onMessage.addListener(({ message }, sender) => {
  if (message === REQUEST_TAB_ID) {
    return Promise.resolve(sender.tab?.id);
  }
});

const background = new Relay();

browser.runtime.onConnect.addListener((port) => {
  if (port.sender?.tab?.id) {
    ports.set(port.sender.tab.id, port);
  }
  console.log("establish port", port.name);
  background.addConnection(port.name, (message) => {
    console.log(
      "from background",
      port.name,
      "->",
      message.to,
      message.message
    );
    port.postMessage(message);
  });

  port.onMessage.addListener((message) => {
    console.log("from port", port.name, "->", message.to, message.message);
    console.log(ports);
    background.broadcast(message);
  });

  port.onDisconnect.addListener((port) => {
    console.log("remove connection", port.name);
    background.removeConnection(port.name);
  });
});
