import { MessageType } from "./messages";
import type { MessageAdapter } from "./messageAdapters";
import type { ApolloClientInfo, ExplorerResponse } from "../types";
import type { DocumentNode, FetchPolicy } from "@apollo/client";
import type { JSONObject } from "../application/types/json";
import type { DevToolsMachineEvents } from "../application/machines/devtoolsMachine";
declare const NeedsTransfer: unique symbol;

export type ActorMessage =
  | {
      type: "connectClient";
      port: MessagePort;
      [NeedsTransfer]?: [MessagePort];
    }
  | { type: "disconnectClient" }
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

export interface ActorDevtoolsMessage {
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
  send: <Message extends ActorMessage>(
    message: Message,
    ...args: Extract<ActorMessage, { type: Message["type"] }> extends {
      [NeedsTransfer]?: infer T;
    }
      ? [T]
      : [never?]
  ) => void;
}

export function createActor(adapter: MessageAdapter): Actor {
  const on: Actor["on"] = (name, callback, options = {}) => {
    const unsubscribe = adapter.on(MessageType.Actor, ({ message }) => {
      if (message.type === name) {
        callback(message);
      }
    });

    options.signal?.addEventListener("abort", unsubscribe, { once: true });
    return unsubscribe;
  };

  return {
    on,
    send: (message: ActorMessage, transfer?: any) => {
      adapter.postMessage({ type: MessageType.Actor, message }, transfer);
    },
  };
}

export interface OptionsWithAbortSignal {
  signal?: AbortSignal;
}
