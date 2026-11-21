const SOURCE = "apollo-client-devtools-channel";

interface ConnectClientMessage {
  source: typeof SOURCE;
  type: "connectClient";
  clientId: string;
}

interface ConnectTabMessage {
  source: typeof SOURCE;
  type: "connectTab";
}

type ConnectMessage = ConnectClientMessage | ConnectTabMessage;

function isConnectMessage<MessageType extends ConnectMessage["type"]>(
  message: unknown,
  type: MessageType
): message is Extract<ConnectMessage, { type: MessageType }> {
  return (
    message != null &&
    typeof message === "object" &&
    "source" in message &&
    message.source === SOURCE &&
    "type" in message &&
    message.type === type
  );
}

// Both manifests inject tab.js before hook.js at document_start, so the tab's
// listener is installed synchronously before the hook sends its message.
export function createTabMessagePort(window: Window): MessagePort {
  const { port1, port2 } = new MessageChannel();
  window.postMessage(
    { source: SOURCE, type: "connectTab" } satisfies ConnectTabMessage,
    "*",
    [port2]
  );
  return port1;
}

export function connectTabMessagePort(
  window: Window,
  connected: (port: MessagePort) => void
) {
  function handleMessage(event: MessageEvent) {
    if (
      event.isTrusted &&
      event.source === window &&
      isConnectMessage(event.data, "connectTab") &&
      event.ports.length === 1
    ) {
      event.stopImmediatePropagation();
      window.removeEventListener("message", handleMessage, { capture: true });
      connected(event.ports[0]);
    }
  }

  window.addEventListener("message", handleMessage, { capture: true });
}

export function createClientMessagePort(window: Window, clientId: string) {
  const { port1, port2 } = new MessageChannel();
  window.postMessage(
    {
      source: SOURCE,
      type: "connectClient",
      clientId,
    } satisfies ConnectClientMessage,
    "*",
    [port2]
  );
  return port1;
}

export function connectClientMessagePort(
  window: Window,
  connected: (port: MessagePort, clientId: string) => void
) {
  function handleMessage(event: MessageEvent) {
    if (
      event.source === window &&
      isConnectMessage(event.data, "connectClient")
    ) {
      connected(event.ports[0], event.data.clientId);
    }
  }

  window.addEventListener("message", handleMessage);
}
