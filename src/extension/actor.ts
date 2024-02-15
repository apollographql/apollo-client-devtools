import browser from "webextension-polyfill";
import type { MessageFormat } from "./messages";
import { isApolloClientDevtoolsMessage } from "./messages";

interface Actor<Messages extends MessageFormat> {
  on: <TName extends Messages["type"]>(
    name: TName,
    callback: (
      ...args: Extract<Messages, { type: TName }> extends {
        payload: infer TPayload;
      }
        ? [payload: TPayload]
        : []
    ) => void
  ) => () => void;
  send: <TName extends Messages["type"]>(
    name: TName,
    ...args: Extract<Messages, { type: TName }> extends {
      payload: infer TPayload;
    }
      ? [payload: TPayload]
      : []
  ) => void;
  proxy: (name: Messages["type"], actor: Actor<Messages>) => () => void;
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
    Set<(...args: unknown[]) => void>
  >();

  function handleMessage(message: unknown) {
    if (!isApolloClientDevtoolsMessage(message)) {
      return;
    }

    const listeners = messageListeners.get(message.message.type);

    if (listeners) {
      for (const listener of listeners) {
        if ("payload" in message.message) {
          listener(message.message.payload);
        } else {
          listener();
        }
      }
    }
  }

  adapter.addListener(handleMessage);

  const on: Actor<Messages>["on"] = (name, callback) => {
    let listeners = messageListeners.get(name);

    if (!listeners) {
      listeners = new Set();
      messageListeners.set(name, listeners);
    }

    listeners.add(callback);

    return () => {
      listeners!.delete(callback);
    };
  };

  return {
    on,
    send: (name, ...args) => {
      const [payload] = args;

      adapter.postMessage({
        source: "apollo-client-devtools",
        message: {
          type: name,
          ...(payload ? { payload } : {}),
        },
      });
    },
    proxy: (name, actor) => {
      return on(name, (...args) => actor.send(name, ...args));
    },
  };
}

export function createPortActor<Messages extends MessageFormat>(
  port: browser.Runtime.Port
) {
  return createActor<Messages>(createPortMessageAdapter(port));
}

export function createWindowActor<Messages extends MessageFormat>(
  window: Window
) {
  return createActor<Messages>(createWindowMessageAdapter(window));
}
