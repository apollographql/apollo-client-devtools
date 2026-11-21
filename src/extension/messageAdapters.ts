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
  postMessage: (message: ApolloClientDevtoolsMessage) => void;
  connect?: (reconnect: () => void) => void;
  disconnect?: (this: MessageAdapter) => void;
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
  private disconnectListeners = new Set<() => void>();
  private source: MessageAdapterSource;
  private unsubscribe: (() => void) | undefined;

  private jsonSerialize: boolean;

  private _closed = false;

  constructor({ jsonSerialize = false, ...source }: MessageAdapterOptions) {
    this.source = source;
    this.jsonSerialize = jsonSerialize;
    this.handleMessage = this.handleMessage.bind(this);

    this.source.connect?.call(this, () => this.resubscribe());
  }

  get closed() {
    return this._closed;
  }

  addListener(listener: (message: ApolloClientDevtoolsMessage) => void) {
    if (this.closed) return () => {};

    if (!this.listeners.size) {
      this.unsubscribe = this.source.addListener(this.handleMessage);
    }

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);

      if (this.listeners.size === 0) {
        this.unsubscribe?.();
        this.unsubscribe = undefined;
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

  postMessage(message: DevtoolsMessage) {
    if (this.closed) return;
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
        this.jsonSerialize
          ? (JSON.parse(JSON.stringify(message)) as typeof message)
          : message
      )
    );
  }

  onDisconnect(listener: () => void) {
    if (this.closed) return () => {};

    this.disconnectListeners.add(listener);

    return () => {
      this.disconnectListeners.delete(listener);
    };
  }

  disconnect() {
    if (this.closed) return;

    this._closed = true;
    this.unsubscribe?.();
    this.listeners.clear();
    this.source.disconnect?.call(this);
    this.disconnectListeners.forEach((listener) => listener());
    this.disconnectListeners.clear();
  }

  private resubscribe() {
    if (this.closed || !this.unsubscribe) return;

    this.unsubscribe();
    this.unsubscribe = this.source.addListener(this.handleMessage);
  }

  private handleMessage(message: unknown) {
    if (!isDevtoolsMessage(message)) return;

    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (e) {
        reportListenerError(e);
      }
    });
  }
}

export function createPortMessageAdapter(
  createPort: () => browser.Runtime.Port
): MessageAdapter {
  let port = createPort();

  return new MessageAdapter({
    addListener(listener) {
      const current = port;
      current.onMessage.addListener(listener);

      return () => {
        current.onMessage.removeListener(listener);
      };
    },
    postMessage(message) {
      return port.postMessage(message);
    },
    connect(reconnect) {
      function handleDisconnect() {
        port = createPort();
        port.onDisconnect.removeListener(handleDisconnect);
        reconnect();
      }

      port.onDisconnect.addListener(handleDisconnect);
    },
    disconnect() {
      port.disconnect();
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
    postMessage(message) {
      portPostMessage(port, message);
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
  adapter2: MessageAdapter
) {
  const removeListener1 = forward(adapter1, adapter2);
  const removeListener2 = forward(adapter2, adapter1);

  return () => {
    removeListener1();
    removeListener2();
  };
}

function forward(source: MessageAdapter, target: MessageAdapter) {
  return source.addListener((message) => {
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
