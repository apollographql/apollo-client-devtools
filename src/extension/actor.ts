import browser from "webextension-polyfill";
import type { ApolloClientDevtoolsMessage, MessageFormat } from "./messages";
import { isApolloClientDevtoolsMessage } from "./messages";
import type { SafeAny } from "../types";
import {
  MessageAdapter,
  createPortMessageAdapter,
  createWindowMessageAdapter,
} from "./messageAdapters";

export interface Actor<Messages extends MessageFormat> {
  on: <TName extends Messages["type"]>(
    name: TName,
    callback: Extract<Messages, { type: TName }> extends infer Message
      ? (message: Message) => void
      : never
  ) => () => void;
  forwardTo: (actor: Actor<SafeAny>) => () => void;
  send: (message: Messages) => void;
  __forwardMessage: (message: ApolloClientDevtoolsMessage<SafeAny>) => void;
}

export function createActor<Messages extends MessageFormat>(
  adapter: MessageAdapter
): Actor<Messages> {
  let removeListener: (() => void) | null = null;
  const messageListeners = new Map<
    Messages["type"],
    Set<(message: Messages) => void>
  >();
  const proxies = new Set<
    (message: ApolloClientDevtoolsMessage<SafeAny>) => void
  >();

  function handleMessage(message: unknown) {
    if (!isApolloClientDevtoolsMessage<Messages>(message)) {
      return;
    }

    const listeners = messageListeners.get(message.message.type);

    if (listeners) {
      for (const listener of listeners) {
        listener(message.message);
      }
    }

    proxies.forEach((forward) => forward(message));
  }

  function startListening() {
    if (!removeListener) {
      removeListener = adapter.addListener(handleMessage);
    }
  }

  function stopListening() {
    if (removeListener && messageListeners.size === 0 && proxies.size === 0) {
      removeListener();
      removeListener = null;
    }
  }

  return {
    on: (name, callback) => {
      let listeners = messageListeners.get(name) as Set<typeof callback>;

      if (!listeners) {
        listeners = new Set();
        messageListeners.set(
          name,
          listeners as Set<(message: Messages) => void>
        );
      }

      listeners.add(callback);
      startListening();

      return () => {
        listeners!.delete(callback);

        if (listeners.size === 0) {
          messageListeners.delete(name);
        }

        stopListening();
      };
    },
    forwardTo: (actor) => {
      proxies.add(actor.__forwardMessage);
      startListening();

      return () => {
        proxies.delete(actor.__forwardMessage);
        stopListening();
      };
    },
    send: (message) => {
      adapter.postMessage({
        source: "apollo-client-devtools",
        message,
      });
    },
    // "Private" function used to forward the message untouched. This ensures
    // rpc messages that make it through untouched
    __forwardMessage: (message) => adapter.postMessage(message),
  };
}

export function createPortActor<
  Messages extends MessageFormat = {
    type: "Error: Pass <Messages> to `createPortActor<Messages>()`";
  },
>(port: browser.Runtime.Port) {
  return createActor<Messages>(createPortMessageAdapter(port));
}

export function createWindowActor<
  Messages extends MessageFormat = {
    type: "Error: Pass <Messages> to `createWindowActor<Messages>()`";
  },
>(window: Window) {
  return createActor<Messages>(createWindowMessageAdapter(window));
}
