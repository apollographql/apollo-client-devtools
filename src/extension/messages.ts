import type { ApolloClientInfo, ExplorerResponse, SafeAny } from "../types";
import type { GetStates, GetContext } from "../application/stateMachine";
import type { DevtoolsMachine } from "../application/machines";
import type { ErrorLike } from "serialize-error";

export interface MessageFormat {
  type: string;
  [key: string]: unknown;
}

export const enum MessageType {
  RPCRequest = "rpcRequest",
  RPCResponse = "rpcResponse",
  Event = "event",
}

export type RPCRequestMessage<Params extends SafeAny[] = unknown[]> = {
  source: "apollo-client-devtools";
  type: MessageType.RPCRequest;
  id: string;
  name: string;
  params: Params;
};

export type RPCErrorResponseMessage = {
  source: "apollo-client-devtools";
  type: MessageType.RPCResponse;
  id: string;
  sourceId: string;
  error: ErrorLike | string;
};

export type RPCSuccessResponseMessage<Result = unknown> = {
  source: "apollo-client-devtools";
  type: MessageType.RPCResponse;
  id: string;
  sourceId: string;
  result: Result;
};

export type RPCResponseMessage<Result = unknown> =
  | RPCSuccessResponseMessage<Result>
  | RPCErrorResponseMessage;

export type RPCMessage<
  Params extends SafeAny[] = unknown[],
  Result = unknown,
> = RPCRequestMessage<Params> | RPCResponseMessage<Result>;

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
  | RPCRequestMessage
  | RPCResponseMessage;

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

type RegisterClientMessage = {
  type: "registerClient";
  payload: ApolloClientInfo;
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
  | ExplorerSubscriptionTerminationMessage
  | RegisterClientMessage;

export type PanelMessage =
  | ExplorerRequestMessage
  | ExplorerResponseMessage
  | ExplorerSubscriptionTerminationMessage
  | RegisterClientMessage
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
  getClients(): Array<ApolloClientInfo>;
};

function isDevtoolsMessage<Message extends Record<string, unknown>>(
  message: unknown
): message is ApolloClientDevtoolsMessage<Message> {
  return (
    typeof message === "object" &&
    message !== null &&
    "source" in message &&
    message.source === "apollo-client-devtools"
  );
}

export function isRPCRequestMessage(
  message: unknown
): message is RPCRequestMessage {
  return isDevtoolsMessage(message) && message.type === MessageType.RPCRequest;
}

export function isRPCResponseMessage(
  message: unknown
): message is RPCResponseMessage {
  return isDevtoolsMessage(message) && message.type === MessageType.RPCResponse;
}

export function isRPCMessage(message: unknown): message is RPCMessage {
  return isRPCRequestMessage(message) || isRPCResponseMessage(message);
}

export function isEventMessage<Message extends Record<string, unknown>>(
  message: unknown
): message is ApolloClientDevtoolsEventMessage<Message> {
  return isDevtoolsMessage(message) && message.type === MessageType.Event;
}
