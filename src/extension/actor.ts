import type { MessageTarget } from "./messages";
import { MessageType } from "./messages";
import type { MessageAdapter } from "./messageAdapters";
import type { ExplorerResponse } from "../types";
import type { DocumentNode, FetchPolicy } from "@apollo/client";
import type { JSONObject } from "../application/types/json";
import type { DevToolsMachineEvents } from "../application/machines/devtoolsMachine";

export type ActorMessage =
  | { type: "registerClient"; clientId: string }
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
  target?: MessageTarget | undefined;
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
  send: (message: ActorMessage, target?: MessageTarget) => void;
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
    send: (message, target) => {
      adapter.postMessage({ type: MessageType.Actor, message, target });
    },
  };
}

export interface OptionsWithAbortSignal {
  signal?: AbortSignal;
}
