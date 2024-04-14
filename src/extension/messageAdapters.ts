import type browser from "webextension-polyfill";
import type { ApolloClientDevtoolsMessage } from "./messages";

export interface MessageAdapter<
  PostMessageFormat extends ApolloClientDevtoolsMessage<
    Record<string, unknown>
  >,
> {
  addListener: (listener: (message: unknown) => void) => () => void;
  postMessage: (message: PostMessageFormat) => void;
}

export function createPortMessageAdapter<
  PostMessageFormat extends Record<string, unknown> = Record<string, unknown>,
>(
  createPort: () => browser.Runtime.Port
): MessageAdapter<ApolloClientDevtoolsMessage<PostMessageFormat>> {
  const listeners = new Set<(message: unknown) => void>();
  let port = createPort();

  function initializePort() {
    listeners.forEach((listener) => {
      port.onMessage.addListener(listener);
    });

    port.onDisconnect.addListener(() => {
      listeners.forEach((listener) => {
        port.onMessage.removeListener(listener);
      });

      port = createPort();
      initializePort();
    });
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

export function createWindowMessageAdapter<
  PostMessageFormat extends Record<string, unknown> = Record<string, unknown>,
>(
  window: Window
): MessageAdapter<ApolloClientDevtoolsMessage<PostMessageFormat>> {
  return {
    addListener(listener) {
      function handleEvent({ data }: MessageEvent) {
        listener(data);
      }

      window.addEventListener("message", handleEvent);

      return () => {
        window.removeEventListener("message", handleEvent);
      };
    },
    postMessage(message) {
      window.postMessage(message, "*");
    },
  };
}
