import type { EventMessage } from "./messages";
import { MessageType, isEventMessage } from "./messages";
import type { MessageAdapter } from "./messageAdapters";
import { createWindowMessageAdapter } from "./messageAdapters";
import { createId } from "../utils/createId";

export interface Actor {
  on: <TName extends EventMessage["type"]>(
    name: TName,
    callback: Extract<EventMessage, { type: TName }> extends infer Message
      ? (message: Message) => void
      : never
  ) => () => void;
  send: (message: EventMessage) => void;
}

export function createActor(adapter: MessageAdapter): Actor {
  let removeListener: (() => void) | null = null;
  const messageListeners = new Map<
    EventMessage["type"],
    Set<(message: EventMessage) => void>
  >();

  function handleMessage(message: unknown) {
    if (!isEventMessage(message)) {
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

  const on: Actor["on"] = (name, callback) => {
    let listeners = messageListeners.get(name) as Set<typeof callback>;

    if (!listeners) {
      listeners = new Set();
      messageListeners.set(
        name,
        listeners as Set<(message: EventMessage) => void>
      );
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
        id: createId(),
        source: "apollo-client-devtools",
        type: MessageType.Event,
        message,
      });
    },
  };
}

export function createWindowActor(window: Window) {
  return createActor(createWindowMessageAdapter(window));
}
