const SOURCE = "apollo-client-devtools-channel";

// Both manifests inject tab.js before hook.js at document_start, so the tab's
// listener is installed synchronously before the hook sends its message.
export function connectHook(window: Window): MessagePort {
  const { port1, port2 } = new MessageChannel();
  window.postMessage({ source: SOURCE, type: "connect" }, "*", [port2]);
  return port1;
}

export function connectTab(
  window: Window,
  connected: (port: MessagePort) => void
) {
  function handleMessage(event: MessageEvent) {
    if (
      event.source === window &&
      event.data?.source === SOURCE &&
      event.data.type === "connect" &&
      event.ports.length === 1
    ) {
      window.removeEventListener("message", handleMessage);
      connected(event.ports[0]);
    }
  }

  window.addEventListener("message", handleMessage);
}
