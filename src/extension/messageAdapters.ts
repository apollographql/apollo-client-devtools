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
  let currentPort = createPort();
  const listeners = new Set<(message: unknown) => void>();

  function handleDisconnect() {
    listeners.forEach((listener) => {
      currentPort.onMessage.removeListener(listener);
    });

    currentPort.onDisconnect.removeListener(handleDisconnect);
    currentPort = createPort();

    initializePort();
  }

  function initializePort() {
    listeners.forEach((listener) =>
      currentPort.onMessage.addListener(listener)
    );
    currentPort.onDisconnect.addListener(handleDisconnect);
  }

  initializePort();

  return {
    addListener(listener) {
      listeners.add(listener);
      currentPort.onMessage.addListener(listener);

      return () => {
        listeners.delete(listener);
        currentPort.onMessage.removeListener(listener);
      };
    },
    postMessage(message) {
      return currentPort.postMessage(message);
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
