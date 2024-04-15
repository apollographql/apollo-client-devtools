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

interface PortMessageAdapter<
  PostMessageFormat extends ApolloClientDevtoolsMessage<
    Record<string, unknown>
  >,
> extends MessageAdapter<PostMessageFormat> {
  replacePort: (port: browser.Runtime.Port) => void;
}

export function createPortMessageAdapter<
  PostMessageFormat extends Record<string, unknown> = Record<string, unknown>,
>(
  port: browser.Runtime.Port,
  options: {
    onContextInvalidated?: () => void;
  } = Object.create(null)
): PortMessageAdapter<ApolloClientDevtoolsMessage<PostMessageFormat>> {
  let currentPort = port;
  const listeners = new Set<(message: unknown) => void>();

  function handleDisconnect() {
    listeners.forEach((listener) => {
      currentPort.onMessage.removeListener(listener);
    });
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
      try {
        console.log("send", message);
        currentPort.postMessage(message);
      } catch (e) {
        if (
          e instanceof Error &&
          e.message.includes("Extension context invalidated")
        ) {
          console.log("onContextInvalidated");
          options.onContextInvalidated?.();
        }
      }
    },
    replacePort(port: browser.Runtime.Port) {
      listeners.forEach((listener) =>
        currentPort.onMessage.removeListener(listener)
      );
      currentPort.onDisconnect.removeListener(handleDisconnect);
      currentPort = port;

      initializePort();
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
