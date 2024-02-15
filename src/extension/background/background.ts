import { REQUEST_TAB_ID } from "../constants";
import browser from "webextension-polyfill";

const ports: Record<
  number,
  {
    tab: browser.Runtime.Port | null;
    extension: browser.Runtime.Port | null;
    disconnect: (() => void) | null;
  }
> = {};

function isNumeric(value: string) {
  return !isNaN(+value);
}

function registerTab(tabId: number) {
  ports[tabId] = {
    tab: null,
    extension: null,
    disconnect: null,
  };
}

function registerTabPort(tabId: number, port: browser.Runtime.Port) {
  ports[tabId].tab = port;

  port.onDisconnect.addListener(() => {
    ports[tabId].disconnect?.();
    ports[tabId].tab = null;
  });
}

function registerExtensionPort(tabId: number, port: browser.Runtime.Port) {
  ports[tabId].extension = port;

  port.onDisconnect.addListener(() => {
    ports[tabId].disconnect?.();
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
  const tabPort = ports[tabId].extension;

  if (!extensionPort) {
    throw new Error("Attempted to connect extension port which does not exist");
  }

  if (!tabPort) {
    throw new Error("Attempted to connect tab port which does not exist");
  }

  if (ports[tabId].disconnect) {
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

    ports[tabId].disconnect = null;
  }

  ports[tabId].disconnect = disconnectPorts;

  extensionPort.onMessage.addListener(extensionPortListener);
  extensionPort.onDisconnect.addListener(disconnectPorts);

  tabPort.onMessage.addListener(tabPortListener);
  tabPort.onDisconnect.addListener(disconnectPorts);
}

browser.runtime.onConnect.addListener((port) => {
  if (port.name === "tab") {
    if (port.sender?.tab?.id == null) {
      return;
    }

    const tabId = port.sender.tab.id;

    if (ports[tabId]?.tab) {
      ports[tabId].disconnect?.();
      ports[tabId].tab?.disconnect();
    }

    registerTab(tabId);
    registerTabPort(tabId, port);

    if (ports[tabId].extension) {
      connectPorts(tabId);
    }

    return;
  }

  // The devtools port is identified by the tab id
  if (isNumeric(port.name)) {
    const tabId = +port.name;

    registerTab(tabId);
    registerExtensionPort(tabId, port);

    if (ports[tabId].tab) {
      connectPorts(tabId);
    }

    return;
  }

  throw new Error(`Unknown port ${port.name} connected`);
});

// This sends the tab id to the inspected tab.
browser.runtime.onMessage.addListener(({ message }, sender) => {
  if (message === REQUEST_TAB_ID) {
    return Promise.resolve(sender.tab?.id);
  }
});
