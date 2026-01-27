// https://github.com/facebook/react/blob/4ea424e63d1a74ce57ef675b64a8c4eabfdb2fdc/packages/react-devtools-extensions/src/background/index.js
// which is released under a MIT license (Copyright (c) Meta Platforms, Inc. and affiliates.) that can be found here:
// https://github.com/facebook/react/blob/18a9dd1c60fdb711982f32ce5d91acfe8f158fe1/LICENSE
import browser from "webextension-polyfill";
import "./errorcodes";
import { createDevtoolsMessage, MessageType } from "../messages";

const ports: Record<
  number,
  {
    tabPorts: Set<browser.Runtime.Port>;
    extension: browser.Runtime.Port | null;
    disconnectPorts: (() => void) | null;
  }
> = {};

function registerTab(tabId: number) {
  if (!ports[tabId]) {
    ports[tabId] = {
      tabPorts: new Set(),
      extension: null,
      disconnectPorts: null,
    };
  }
}

function registerTabPort(tabId: number, port: browser.Runtime.Port) {
  ports[tabId].tabPorts.add(port);

  port.onDisconnect.addListener(() => {
    ports[tabId].tabPorts.delete(port);
    if (ports[tabId].tabPorts.size === 0) {
      ports[tabId].disconnectPorts?.();
    }
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
  const tabPorts = ports[tabId].tabPorts;

  if (!extensionPort) {
    throw new Error("Attempted to connect extension port which does not exist");
  }

  if (tabPorts.size === 0) {
    throw new Error("Attempted to connect with no tab ports");
  }

  if (ports[tabId].disconnectPorts) {
    // Already connected, but we may have new tab ports to add listeners to
    // We need to add listeners for any new ports
    return;
  }

  const tabPortListeners = new Map<
    browser.Runtime.Port,
    (message: unknown) => void
  >();

  function extensionPortListener(message: unknown) {
    // Broadcast to ALL tab ports (main window + iframes)
    for (const tabPort of tabPorts) {
      try {
        tabPort.postMessage(message);
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.error(`Broken connection to frame in tab ${tabId}`);
        }
        tabPorts.delete(tabPort);
      }
    }
  }

  function createTabPortListener() {
    return function tabPortListener(message: unknown) {
      try {
        extensionPort!.postMessage(message);
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.error(`Broken connection ${tabId}`);
        }
        disconnectPorts();
      }
    };
  }

  function disconnectPorts() {
    extensionPort!.onMessage.removeListener(extensionPortListener);
    for (const [tabPort, listener] of tabPortListeners) {
      tabPort.onMessage.removeListener(listener);
    }
    tabPortListeners.clear();
    ports[tabId].disconnectPorts = null;
  }

  ports[tabId].disconnectPorts = disconnectPorts;

  extensionPort.onMessage.addListener(extensionPortListener);
  extensionPort.onDisconnect.addListener(disconnectPorts);
  extensionPort.onDisconnect.addListener(() => {
    for (const tabPort of tabPorts) {
      tabPort.postMessage(
        createDevtoolsMessage({
          type: MessageType.Actor,
          message: { type: "devtoolsDisconnected" },
        })
      );
    }
  });

  // Add listeners for all current tab ports
  for (const tabPort of tabPorts) {
    const listener = createTabPortListener();
    tabPortListeners.set(tabPort, listener);
    tabPort.onMessage.addListener(listener);
    tabPort.onDisconnect.addListener(() => {
      const l = tabPortListeners.get(tabPort);
      if (l) {
        tabPort.onMessage.removeListener(l);
        tabPortListeners.delete(tabPort);
      }
    });
  }
}

function connectTabPort(port: browser.Runtime.Port) {
  if (port.sender?.tab?.id == null) {
    return;
  }

  const tabId = port.sender.tab.id;

  registerTab(tabId);
  registerTabPort(tabId, port);

  if (ports[tabId].extension) {
    connectPorts(tabId);
    // If already connected, add listener for this new port
    if (ports[tabId].disconnectPorts) {
      // Need to add message listener for this new tab port
      const extensionPort = ports[tabId].extension!;
      const listener = (message: unknown) => {
        try {
          extensionPort.postMessage(message);
        } catch (e) {
          if (process.env.NODE_ENV === "development") {
            console.error(`Broken connection ${tabId}`);
          }
        }
      };
      port.onMessage.addListener(listener);
      port.onDisconnect.addListener(() => {
        port.onMessage.removeListener(listener);
      });
    }
  }
}

function connectExtensionPort(port: browser.Runtime.Port) {
  const tabId = +port.name;

  registerTab(tabId);
  registerExtensionPort(tabId, port);

  if (ports[tabId].tabPorts.size > 0) {
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
