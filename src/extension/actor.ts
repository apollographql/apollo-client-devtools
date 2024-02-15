import browser from "webextension-polyfill";
import type { ApolloClientDevtoolsMessage, Message } from "./messages";
import { isApolloClientDevtoolsMessage } from "./messages";

interface MessageAdapter {
  addListener: (listener: (message: unknown) => void) => void;
  postMessage: (message: ApolloClientDevtoolsMessage) => void;
}

function createWindowMessageAdapter(): MessageAdapter {
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

function createActor(adapter: MessageAdapter) {
  const messageListeners = new Map<
    Message["type"],
    Set<(...args: unknown[]) => void>
  >();

  function on<TName extends Message["type"]>(
    name: TName,
    callback: (
      ...args: Extract<Message, { type: TName }> extends {
        payload: infer TPayload;
      }
        ? [payload: TPayload]
        : []
    ) => void
  ) {
    let listeners = messageListeners.get(name);

    if (!listeners) {
      listeners = new Set();
      messageListeners.set(name, listeners);
    }

    listeners.add(callback);

    return () => {
      listeners!.delete(callback);
    };
  }

  function send<TName extends Message["type"]>(
    name: TName,
    ...args: Extract<Message, { type: TName }> extends {
      payload: infer TPayload;
    }
      ? [payload: TPayload]
      : []
  ) {
    const [payload] = args;

    adapter.postMessage({
      source: "apollo-client-devtools",
      message: { type: name, ...(payload ? { payload } : {}) } as Message,
    });
  }

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

  return { on, send };
}

export function createPortActor(port: browser.Runtime.Port) {
  return createActor(createPortMessageAdapter(port));
}

export function createWindowActor() {
  return createActor(createWindowMessageAdapter());
}
