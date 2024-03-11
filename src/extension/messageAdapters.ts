import browser from "webextension-polyfill";
import { ApolloClientDevtoolsMessage } from "./messages";

export interface MessageAdapter {
  addListener: (listener: (message: unknown) => void) => () => void;
  postMessage: (
    message: ApolloClientDevtoolsMessage<Record<string, unknown>>
  ) => void;
}

export function createPortMessageAdapter(
  port: browser.Runtime.Port
): MessageAdapter {
  return {
    addListener(listener) {
      port.onMessage.addListener(listener);
      port.onDisconnect.addListener(() => {
        port.onMessage.removeListener(listener);
      });

      return () => {
        port.onMessage.removeListener(listener);
      };
    },
    postMessage(message) {
      return port.postMessage(message);
    },
  };
}

export function createWindowMessageAdapter(window: Window): MessageAdapter {
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
