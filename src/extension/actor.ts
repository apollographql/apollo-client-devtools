import type browser from "webextension-polyfill";
import type {
  ApolloClientDevtoolsEventMessage,
  MessageFormat,
} from "./messages";
import { MessageType, isEventMessage } from "./messages";
import type { NoInfer } from "../types";
import type { MessageAdapter } from "./messageAdapters";
import {
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
  send: (message: Messages) => void;
  forward: <TName extends Messages["type"]>(
    name: TName,
    actor: Actor<Extract<Messages, { type: NoInfer<TName> }>>
  ) => () => void;
}

export function createActor<
  Messages extends MessageFormat = {
    type: "Error: Pass <Messages> to `createActor<Messages>()`";
  },
>(
  adapter: MessageAdapter<ApolloClientDevtoolsEventMessage<Messages>>
): Actor<Messages> {
  let removeListener: (() => void) | null = null;
  const messageListeners = new Map<
    Messages["type"],
    Set<(message: Messages) => void>
  >();

  function handleMessage(message: unknown) {
    if (!isEventMessage<Messages>(message)) {
      return;
    }

    const listeners = messageListeners.get(message.message.type);

    if (listeners) {
      for (const listener of listeners) {
        listener(message.message);
      }
    }
  }

  function startListening() {
    if (!removeListener) {
      removeListener = adapter.addListener(handleMessage);
    }
  }

  function stopListening() {
    if (removeListener) {
      removeListener();
      removeListener = null;
    }
  }

  const on: Actor<Messages>["on"] = (name, callback) => {
    let listeners = messageListeners.get(name) as Set<typeof callback>;

    if (!listeners) {
      listeners = new Set();
      messageListeners.set(name, listeners as Set<(message: Messages) => void>);
    }

    listeners.add(callback);
    startListening();

    return () => {
      listeners!.delete(callback);

      if (listeners.size === 0) {
        messageListeners.delete(name);
      }

      if (messageListeners.size === 0) {
        stopListening();
      }
    };
  };

  return {
    on,
    send: (message) => {
      adapter.postMessage({
        source: "apollo-client-devtools",
        type: MessageType.Event,
        message,
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    forward: (name, actor) => on(name, actor.send as unknown as any),
  };
}

export function createWindowActor<
  Messages extends MessageFormat = {
    type: "Error: Pass <Messages> to `createWindowActor<Messages>()`";
  },
>(window: Window) {
  return createActor<Messages>(createWindowMessageAdapter(window));
}
