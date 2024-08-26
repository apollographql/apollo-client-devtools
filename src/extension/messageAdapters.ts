import type browser from "webextension-polyfill";
import { isDevtoolsMessage } from "./messages";
import type { ApolloClientDevtoolsMessage } from "./messages";

export interface MessageAdapter {
  addListener: (listener: (message: unknown) => void) => () => void;
  postMessage: (message: ApolloClientDevtoolsMessage) => void;
}

export function createPortMessageAdapter(
  createPort: () => browser.Runtime.Port
): MessageAdapter {
  let port = createPort();
  const listeners = new Set<(message: unknown) => void>();

  function handleDisconnect() {
    listeners.forEach((listener) => {
      port.onMessage.removeListener(listener);
    });

    port.onDisconnect.removeListener(handleDisconnect);
    port = createPort();

    initializePort();
  }

  function initializePort() {
    listeners.forEach((listener) => port.onMessage.addListener(listener));
    port.onDisconnect.addListener(handleDisconnect);
  }

  initializePort();

  return {
    addListener(listener) {
      listeners.add(listener);
      port.onMessage.addListener(listener);

      return () => {
        listeners.delete(listener);
        port.onMessage.removeListener(listener);
      };
    },
    postMessage(message) {
      return port.postMessage(message);
    },
  };
}

interface WindowMessageAdapterOptions {
  jsonSerialize?: boolean;
}

export function createWindowMessageAdapter(
  window: Window,
  options: WindowMessageAdapterOptions = {}
): MessageAdapter {
  const { jsonSerialize } = options;
  const sentMessageIds = new Set<string>();

  return {
    addListener(listener) {
      function handleEvent({ data }: MessageEvent) {
        // We don't want to trigger listeners for a message sent from this
        // adapter. This prevents situations where e.g. rpc messages were
        // accidentally echoing the rpc request back to the sender rather
        // than just the rpc response.
        if (sentMessageIds.has(data.id)) {
          return sentMessageIds.delete(data.id);
        }

        listener(data);
      }

      window.addEventListener("message", handleEvent);

      return () => {
        window.removeEventListener("message", handleEvent);
      };
    },
    postMessage(message) {
      sentMessageIds.add(message.id);
      // Avoid memory leaks by always cleaning up this ID in case this message
      // adapter doesn't have a listener attached to it.
      setTimeout(() => sentMessageIds.delete(message.id), 10);

      // In some cases, we need to JSON stringify the data transferred in case
      // the payload contains references to irregular data, such as `URL`
      // instances which are not cloneable via `structuredClone` (which
      // `window.postMessage` uses to send messages). `JSON.stringify` tends
      // to serialize these irregular values into something that is cloneable to
      // avoid errors for non-cloneable data.
      //
      // https://github.com/apollographql/apollo-client-devtools/issues/1258
      // https://github.com/apollographql/apollo-client-devtools/issues/1479
      window.postMessage(
        jsonSerialize ? JSON.parse(JSON.stringify(message)) : message,
        "*"
      );
    },
  };
}

export function createMessageBridge(
  adapter1: MessageAdapter,
  adapter2: MessageAdapter
) {
  const removeListener1 = adapter1.addListener((message) => {
    if (isDevtoolsMessage(message)) {
      adapter2.postMessage(message);
    }
  });

  const removeListener2 = adapter2.addListener((message) => {
    if (isDevtoolsMessage(message)) {
      adapter1.postMessage(message);
    }
  });

  return () => {
    removeListener1();
    removeListener2();
  };
}
