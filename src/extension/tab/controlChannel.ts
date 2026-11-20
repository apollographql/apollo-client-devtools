import type { IDv3, IDv4 } from "./clientHandler";

const SOURCE = "apollo-client-devtools-channel";

interface ConnectMessage {
  source: typeof SOURCE;
  type: "connect";
  clientId: string;
}

function isConnectMessage(message: unknown): message is ConnectMessage {
  return (
    message != null &&
    typeof message === "object" &&
    "source" in message &&
    message.source === SOURCE &&
    "type" in message &&
    message.type === "connect"
  );
}

// Both manifests inject tab.js before hook.js at document_start, so the tab's
// listener is installed synchronously before the hook sends its message.
export function connectHook(window: Window): MessagePort {
  const { port1, port2 } = new MessageChannel();
  window.postMessage({ source: SOURCE, type: "old-connect" }, "*", [port2]);
  return port1;
}

export function connectTab(
  window: Window,
  connected: (port: MessagePort) => void
) {
  function handleMessage(event: MessageEvent) {
    if (
      event.isTrusted &&
      event.source === window &&
      event.data?.source === SOURCE &&
      event.data.type === "old-connect" &&
      event.ports.length === 1
    ) {
      event.stopImmediatePropagation();
      window.removeEventListener("message", handleMessage, { capture: true });
      connected(event.ports[0]);
    }
  }

  window.addEventListener("message", handleMessage, { capture: true });
}

export function createClientPort(window: Window, clientId: IDv3 | IDv4) {
  const { port1, port2 } = new MessageChannel();
  window.postMessage(
    { source: SOURCE, type: "connect", clientId } satisfies ConnectMessage,
    "*",
    [port2]
  );
  return port1;
}

export function connectClient(
  window: Window,
  connected: (port: MessagePort, clientId: string) => void
) {
  function handleMessage(event: MessageEvent) {
    if (event.source === window && isConnectMessage(event.data)) {
      connected(event.ports[0], event.data.clientId);
    }
  }

  window.addEventListener("message", handleMessage);
}
