import { ExplorerResponse } from "../types";
import { GetStates, GetContext } from "../application/stateMachine";
import { DevtoolsMachine } from "../application/machines";

export interface MessageFormat {
  type: string;
  [key: string]: unknown;
}

export const enum MessageType {
  RPC = "rpc",
  Event = "event",
}

export type ApolloClientDevtoolsRPCMessage<
  Message extends Record<string, unknown> = Record<string, unknown>,
> = {
  source: "apollo-client-devtools";
  type: MessageType.RPC;
  id: number;
  payload: Message;
};

export type ApolloClientDevtoolsEventMessage<
  Message extends Record<string, unknown> = Record<string, unknown>,
> = {
  source: "apollo-client-devtools";
  type: MessageType.Event;
  message: Message;
};

export type ApolloClientDevtoolsMessage<
  Message extends Record<string, unknown> = Record<string, unknown>,
> =
  | ApolloClientDevtoolsEventMessage<Message>
  | ApolloClientDevtoolsRPCMessage<Message>;

type ExplorerRequestMessage = {
  type: "explorerRequest";
  payload: string;
};

type ExplorerResponseMessage = {
  type: "explorerResponse";
  payload: ExplorerResponse;
};

type ExplorerSubscriptionTerminationMessage = {
  type: "explorerSubscriptionTermination";
};

export type ClientMessage =
  | { type: "clientNotFound" }
  | { type: "connectToClient" }
  | { type: "connectToClientTimeout" }
  | {
      type: "connectToDevtools";
      payload: GetContext<DevtoolsMachine>["clientContext"];
    }
  | { type: "disconnectFromDevtools" }
  | ExplorerRequestMessage
  | ExplorerResponseMessage
  | ExplorerSubscriptionTerminationMessage;

export type PanelMessage =
  | ExplorerRequestMessage
  | ExplorerResponseMessage
  | ExplorerSubscriptionTerminationMessage
  | {
      type: "initializePanel";
      state: GetStates<DevtoolsMachine>;
      payload: GetContext<DevtoolsMachine>["clientContext"];
    }
  | { type: "retryConnection" }
  | { type: "devtoolsStateChanged"; state: GetStates<DevtoolsMachine> }
  | { type: "update"; payload: GetContext<DevtoolsMachine>["clientContext"] };

export type DevtoolsRPCMessage = {
  getClientOperations(): GetContext<DevtoolsMachine>["clientContext"];
};

export function isApolloClientDevtoolsMessage<
  Message extends Record<string, unknown>,
>(message: unknown): message is ApolloClientDevtoolsMessage<Message> {
  return (
    typeof message === "object" &&
    message !== null &&
    "source" in message &&
    message.source === "apollo-client-devtools"
  );
}

export function isRPCMessage<Message extends Record<string, unknown>>(
  message: unknown
): message is ApolloClientDevtoolsRPCMessage<Message> {
  return (
    isApolloClientDevtoolsMessage(message) && message.type === MessageType.RPC
  );
}

export function isEventMessage<Message extends Record<string, unknown>>(
  message: unknown
): message is ApolloClientDevtoolsEventMessage<Message> {
  return (
    isApolloClientDevtoolsMessage(message) && message.type === MessageType.Event
  );
}
