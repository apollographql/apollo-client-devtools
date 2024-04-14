import type browser from "webextension-polyfill";
import type { ApolloClientDevtoolsMessage } from "./messages";

export interface MessageAdapter<
  PostMessageFormat extends ApolloClientDevtoolsMessage<
    Record<string, unknown>
  >,
> {
  addListener: (listener: (message: unknown) => void) => () => void;
  postMessage: (message: PostMessageFormat) => void;
  onDisconnect: (listener: () => void) => void;
}

export function createPortMessageAdapter<
  PostMessageFormat extends Record<string, unknown> = Record<string, unknown>,
>(
  port: browser.Runtime.Port,
  onDisconnect: () => browser.Runtime.Port
): MessageAdapter<ApolloClientDevtoolsMessage<PostMessageFormat>> {
  return {
    addListener(listener) {
      port.onMessage.addListener(listener);
      port.onDisconnect.addListener(() => {
        port.onMessage.removeListener(listener);
        port = onDisconnect();
      });

      return () => {
        port.onMessage.removeListener(listener);
      };
    },
    postMessage(message) {
      return port.postMessage(message);
    },
    onDisconnect: (listener) => {
      function handleDisconnect() {
        listener();
        port.onDisconnect.removeListener(handleDisconnect);
      }

      port.onDisconnect.addListener(handleDisconnect);
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
    onDisconnect: () => {
      // does nothing
    },
  };
}
