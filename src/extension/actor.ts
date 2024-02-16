import browser from "webextension-polyfill";
import type { MessageFormat } from "./messages";
import { isApolloClientDevtoolsMessage } from "./messages";

export interface Actor<Messages extends MessageFormat> {
  on: <TName extends Messages["type"]>(
    name: TName,
    callback: (message: Extract<Messages, { type: TName }>) => void
  ) => () => void;
  send: (message: Messages) => void;
  forward: (name: Messages["type"], actor: Actor<Messages>) => () => void;
}

interface MessageAdapter {
  addListener: (listener: (message: unknown) => void) => void;
  postMessage: (message: unknown) => void;
}

function createWindowMessageAdapter(window: Window): MessageAdapter {
  return {
    addListener(listener) {
      window.addEventListener("message", ({ data }) => {
        listener(data);
      });
    },
    postMessage(message) {
      window.postMessage(message, "*");
    },
  };
}

function createPortMessageAdapter(port: browser.Runtime.Port): MessageAdapter {
  return {
    addListener(listener) {
      port.onMessage.addListener(listener);
      port.onDisconnect.addListener(() => {
        port.onMessage.removeListener(listener);
      });
    },
    postMessage(message) {
      return port.postMessage(message);
    },
  };
}

function createActor<Messages extends MessageFormat>(
  adapter: MessageAdapter
): Actor<Messages> {
  const messageListeners = new Map<
    Messages["type"],
    Set<(message: Messages) => void>
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
  }

  adapter.addListener(handleMessage);

  const on: Actor<Messages>["on"] = (name, callback) => {
    let listeners = messageListeners.get(name) as Set<typeof callback>;

    if (!listeners) {
      listeners = new Set();
      messageListeners.set(name, listeners as Set<(message: Messages) => void>);
    }

    listeners.add(callback);

    return () => {
      listeners!.delete(callback);
    };
  };

  return {
    on,
    send: (message) => {
      adapter.postMessage({
        source: "apollo-client-devtools",
        message,
      });
    },
    forward: (name, actor) => {
      return on(name, (message) => actor.send(message));
    },
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
