import type { ApolloClientDevtoolsMessage } from "./messages";
import { MessageType } from "./messages";
import type { MessageAdapter } from "./messageAdapters";
import { createWindowMessageAdapter } from "./messageAdapters";
import type {
  ApolloClientInfo,
  DevtoolsMessage,
  ExplorerResponse,
} from "../types";
import type { DocumentNode, FetchPolicy } from "@apollo/client";
import type { JSONObject } from "../application/types/json";
import type { DevToolsMachineEvents } from "../application/machines/devtoolsMachine";

export type ActorMessage =
  | { type: "registerClient"; payload: ApolloClientInfo }
  | { type: "clientTerminated"; clientId: string }
  | {
      type: "explorerRequest";
      payload: {
        clientId: string;
        operation: DocumentNode;
        operationName: string | undefined;
        variables: JSONObject | undefined;
        fetchPolicy: FetchPolicy;
      };
    }
  | { type: "explorerResponse"; payload: ExplorerResponse }
  | { type: "explorerSubscriptionTermination" }
  | { type: "pageNavigated" }
  | { type: "panelHidden" }
  | { type: "panelShown" }
  | { type: "devtoolsDisconnected" }
  | {
      type: "vscode:openExternal";
      uri: string;
    }
  | {
      type: "vscode:executeCommand";
      command: string;
      arguments?: unknown[];
    }
  | Extract<
      DevToolsMachineEvents,
      { type: "initializePanel" | "port.changed" }
    >;

export interface ApolloClientDevtoolsActorMessage extends DevtoolsMessage {
  type: MessageType.Actor;
  message: ActorMessage;
}

export interface Actor {
  on: <TName extends ActorMessage["type"]>(
    name: TName,
    callback: Extract<ActorMessage, { type: TName }> extends infer Message
      ? (message: Message) => void
      : never,
    options?: OptionsWithAbortSignal
  ) => () => void;
  send: (message: ActorMessage) => void;
}

export function createActor(adapter: MessageAdapter): Actor {
  let removeListener: (() => void) | null = null;
  const messageListeners = new Map<
    ActorMessage["type"],
    Set<(message: ActorMessage) => void>
  >();

  function handleMessage(message: ApolloClientDevtoolsMessage) {
    if (message.type !== MessageType.Actor) {
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

  const on: Actor["on"] = (name, callback, options = {}) => {
    let listeners = messageListeners.get(name) as Set<typeof callback>;

    if (!listeners) {
      listeners = new Set();
      messageListeners.set(name, listeners);
    }

    listeners.add(callback);
    startListening();

    const cleanup = () => {
      listeners!.delete(callback);

      if (listeners.size === 0) {
        messageListeners.delete(name);
      }

      if (messageListeners.size === 0) {
        stopListening();
      }
    };
    if (options.signal) {
      options.signal.addEventListener("abort", cleanup, { once: true });
    }
    return cleanup;
  };

  return {
    on,
    send: (message) => {
      adapter.postMessage({ type: MessageType.Actor, message });
    },
  };
}

export function createWindowActor(window: Window) {
  return createActor(createWindowMessageAdapter(window));
}

export interface OptionsWithAbortSignal {
  signal?: AbortSignal;
}
