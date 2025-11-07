// https://github.com/facebook/react/blob/4ea424e63d1a74ce57ef675b64a8c4eabfdb2fdc/packages/react-devtools-extensions/src/background/index.js
// which is released under a MIT license (Copyright (c) Meta Platforms, Inc. and affiliates.) that can be found here:
// https://github.com/facebook/react/blob/18a9dd1c60fdb711982f32ce5d91acfe8f158fe1/LICENSE
import browser from "webextension-polyfill";
import "./errorcodes";
import { createDevtoolsMessage, MessageType } from "../messages";

const ports: Record<
  number,
  {
    tab: browser.Runtime.Port | null;
    extension: browser.Runtime.Port | null;
    disconnectPorts: (() => void) | null;
  }
> = {};

function registerTab(tabId: number) {
  if (!ports[tabId]) {
    ports[tabId] = {
      tab: null,
      extension: null,
      disconnectPorts: null,
    };
  }
}

function registerTabPort(tabId: number, port: browser.Runtime.Port) {
  ports[tabId].tab = port;

  port.onDisconnect.addListener(() => {
    ports[tabId].disconnectPorts?.();
    ports[tabId].tab = null;
  });
}

function registerExtensionPort(tabId: number, port: browser.Runtime.Port) {
  ports[tabId].extension = port;

  port.onDisconnect.addListener(() => {
    ports[tabId].disconnectPorts?.();
    ports[tabId].extension = null;
  });
}

function connectPorts(tabId: number) {
  if (!ports[tabId]) {
    throw new Error(
      "Attempted to connect to a tab that has not been registered"
    );
  }

  const extensionPort = ports[tabId].extension;
  const tabPort = ports[tabId].tab;

  if (!extensionPort) {
    throw new Error("Attempted to connect extension port which does not exist");
  }

  if (!tabPort) {
    throw new Error("Attempted to connect tab port which does not exist");
  }

  if (ports[tabId].disconnectPorts) {
    throw new Error(
      `Attempted to connect already connected ports for tab ${tabId}`
    );
  }

  function extensionPortListener(message: unknown) {
    try {
      tabPort!.postMessage(message);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Broken connection ${tabId}`);
      }

      disconnectPorts();
    }
  }

  function tabPortListener(message: unknown) {
    try {
      extensionPort!.postMessage(message);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Broken connection ${tabId}`);
      }

      disconnectPorts();
    }
  }

  function disconnectPorts() {
    extensionPort!.onMessage.removeListener(extensionPortListener);
    tabPort!.onMessage.removeListener(tabPortListener);

    ports[tabId].disconnectPorts = null;
  }

  ports[tabId].disconnectPorts = disconnectPorts;

  extensionPort.onMessage.addListener(extensionPortListener);
  extensionPort.onDisconnect.addListener(disconnectPorts);
  extensionPort.onDisconnect.addListener(() => {
    if (tabPort) {
      tabPort.postMessage(
        createDevtoolsMessage({
          type: MessageType.Actor,
          message: { type: "devtoolsDisconnected" },
        })
      );
    }
  });

  tabPort.onMessage.addListener(tabPortListener);
  tabPort.onDisconnect.addListener(disconnectPorts);
}

function connectTabPort(port: browser.Runtime.Port) {
  if (port.sender?.tab?.id == null) {
    return;
  }

  const tabId = port.sender.tab.id;

  if (ports[tabId]?.tab) {
    ports[tabId].disconnectPorts?.();
    ports[tabId].tab?.disconnect();
  }

  registerTab(tabId);
  registerTabPort(tabId, port);

  if (ports[tabId].extension) {
    connectPorts(tabId);
  }
}

function connectExtensionPort(port: browser.Runtime.Port) {
  const tabId = +port.name;

  registerTab(tabId);
  registerExtensionPort(tabId, port);

  if (ports[tabId].tab) {
    connectPorts(tabId);
  }
}

browser.runtime.onConnect.addListener((port) => {
  if (port.name === "tab") {
    return connectTabPort(port);
  }

  // The devtools port is identified by the tab id
  if (!isNaN(+port.name)) {
    return connectExtensionPort(port);
  }

  throw new Error(`Unknown port ${port.name} connected`);
});
