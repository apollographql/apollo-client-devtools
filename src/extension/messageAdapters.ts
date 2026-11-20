import type browser from "webextension-polyfill";
import {
  createDevtoolsMessage,
  isDevtoolsMessage,
  MessageType,
} from "./messages";
import type { ApolloClientDevtoolsMessage, DevtoolsMessage } from "./messages";
import { serializeError } from "./errorSerialization";

type MessageListener = (message: unknown) => void;

interface MessageAdapterSource {
  addListener: (listener: MessageListener) => () => void;
  postMessage: (
    message: ApolloClientDevtoolsMessage,
    transfer?: Transferable[]
  ) => void;
}

interface MessageAdapterOptions extends MessageAdapterSource {
  jsonSerialize?: boolean;
}

function reportListenerError(error: unknown) {
  if (typeof reportError === "function") {
    reportError(error);
  } else {
    queueMicrotask(() => {
      throw error;
    });
  }
}

export class MessageAdapter {
  private listeners = new Set<(message: ApolloClientDevtoolsMessage) => void>();
  private source: MessageAdapterSource;
  private disconnect: (() => void) | undefined;

  private jsonSerialize: boolean;

  constructor({
    addListener,
    postMessage,
    jsonSerialize = false,
  }: MessageAdapterOptions) {
    this.source = {
      addListener,
      postMessage,
    };
    this.jsonSerialize = jsonSerialize;
  }

  addListener(listener: (message: ApolloClientDevtoolsMessage) => void) {
    const handleMessage: MessageListener = (message) => {
      if (isDevtoolsMessage(message)) {
        this.listeners.forEach((listener) => {
          try {
            listener(message);
          } catch (e) {
            reportListenerError(e);
          }
        });
      }
    };

    if (!this.listeners.size) {
      this.disconnect = this.source.addListener(handleMessage);
    }

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);

      if (this.listeners.size === 0) {
        this.disconnect?.();
        this.disconnect = undefined;
      }
    };
  }

  on<TMessageType extends MessageType>(
    type: TMessageType,
    listener: (
      message: Extract<ApolloClientDevtoolsMessage, { type: TMessageType }>
    ) => void
  ) {
    return this.addListener((message) => {
      if (message.type === type) {
        listener(
          message as Extract<
            ApolloClientDevtoolsMessage,
            { type: TMessageType }
          >
        );
      }
    });
  }

  postMessage(message: DevtoolsMessage, transfer?: Transferable[]) {
    // In some cases, we need to JSON stringify the data transferred in case
    // the payload contains references to irregular data, such as `URL`
    // instances which are not cloneable via `structuredClone` (which
    // `window.postMessage` uses to send messages). `JSON.stringify` tends
    // to serialize these irregular values into something that is cloneable to
    // avoid errors for non-cloneable data.
    //
    // https://github.com/apollographql/apollo-client-devtools/issues/1258
    // https://github.com/apollographql/apollo-client-devtools/issues/1479

    this.source.postMessage(
      createDevtoolsMessage(
        this.jsonSerialize && !transfer?.length
          ? (JSON.parse(JSON.stringify(message)) as typeof message)
          : message
      ),
      transfer
    );
  }
}

/**
 * Use when `port` is externally controlled and cannot be reconnected automatically.
 * Otherwise, prefer `createPortMessageAdapter`.
 */
export function createExternalPortMessageAdapter(
  port: browser.Runtime.Port
): MessageAdapter {
  return new MessageAdapter({
    addListener(listener) {
      port.onMessage.addListener(listener);
      return () => port.onMessage.removeListener(listener);
    },
    postMessage: (message) => port.postMessage(message),
  });
}

export function createPortMessageAdapter(
  createPort: () => browser.Runtime.Port,
  options: { signal?: AbortSignal; onDisconnect?: () => void } = {}
): MessageAdapter {
  let port = createPort();
  const listeners = new Set<(message: unknown) => void>();

  function handleDisconnect() {
    listeners.forEach((listener) => {
      port.onMessage.removeListener(listener);
    });

    port.onDisconnect.removeListener(handleDisconnect);
    options.onDisconnect?.();
    port = createPort();

    initializePort();
  }

  function initializePort() {
    listeners.forEach((listener) => port.onMessage.addListener(listener));
    port.onDisconnect.addListener(handleDisconnect);
  }

  initializePort();
  options.signal?.addEventListener(
    "abort",
    () => {
      port.onDisconnect.removeListener(handleDisconnect);
      listeners.forEach((listener) => port.onMessage.removeListener(listener));
      listeners.clear();
      port.disconnect();
    },
    { once: true }
  );

  return new MessageAdapter({
    addListener(listener) {
      listeners.add(listener);
      port.onMessage.addListener(listener);

      return () => {
        listeners.delete(listener);
        port.onMessage.removeListener(listener);
      };
    },
    postMessage(message) {
      return port.postMessage(message);
    },
  });
}

interface MessagePortMessageAdapterOptions {
  jsonSerialize?: boolean;
}

const call = Function.prototype.call;
const portPostMessage = call.bind(MessagePort.prototype.postMessage);
const getMessageEventData = call.bind(
  Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data")!.get!
);

export function createMessagePortMessageAdapter(
  port: MessagePort,
  options: MessagePortMessageAdapterOptions = {}
): MessageAdapter {
  port.start();

  return new MessageAdapter({
    jsonSerialize: options.jsonSerialize,
    addListener(listener) {
      const handleMessage = (event: MessageEvent) =>
        listener(getMessageEventData(event));
      port.addEventListener("message", handleMessage);

      return () => {
        port.removeEventListener("message", handleMessage);
      };
    },
    postMessage(message, transfer = []) {
      portPostMessage(port, message, transfer);
    },
  });
}

interface WindowMessageAdapterOptions {
  jsonSerialize?: boolean;
}

export function createWindowMessageAdapter(
  window: Window,
  options: WindowMessageAdapterOptions = {}
): MessageAdapter {
  const sentMessageIds = new Set<string>();

  return new MessageAdapter({
    jsonSerialize: options.jsonSerialize,
    addListener(listener) {
      function handleEvent({ data }: MessageEvent) {
        // We don't want to trigger listeners for a message sent from this
        // adapter. This prevents situations where e.g. rpc messages were
        // accidentally echoing the rpc request back to the sender rather
        // than just the rpc response.
        if (sentMessageIds.has(data?.id)) {
          return sentMessageIds.delete(data.id);
        }

        listener(data);
      }

      window.addEventListener("message", handleEvent);

      return () => {
        window.removeEventListener("message", handleEvent);
      };
    },
    postMessage(message) {
      sentMessageIds.add(message.id);
      // Avoid memory leaks by always cleaning up this ID in case this message
      // adapter doesn't have a listener attached to it.
      setTimeout(() => sentMessageIds.delete(message.id), 10);
      window.postMessage(message, "*");
    },
  });
}

export function createMessageBridge(
  adapter1: MessageAdapter,
  adapter2: MessageAdapter,
  shouldForward?: (message: ApolloClientDevtoolsMessage) => boolean
) {
  const removeListener1 = forward(adapter1, adapter2, shouldForward);
  const removeListener2 = forward(adapter2, adapter1, shouldForward);

  return () => {
    removeListener1();
    removeListener2();
  };
}

function forward(
  source: MessageAdapter,
  target: MessageAdapter,
  shouldForward?: (message: ApolloClientDevtoolsMessage) => boolean
) {
  return source.addListener((message) => {
    if (shouldForward && !shouldForward(message)) return;
    try {
      target.postMessage(message);
    } catch (e) {
      source.postMessage({
        type: MessageType.PostMessageError,
        sourceId: message.id,
        error: serializeError(e),
      });
    }
  });
}
