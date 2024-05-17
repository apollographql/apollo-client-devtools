import type { ExplorerResponse, SafeAny } from "../types";
import type { StateValues, ClientContext } from "../application/machines";
import type { JSONObject } from "../application/types/json";
import type { FetchPolicy, DocumentNode } from "@apollo/client";

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
  error: { name?: string; message: string; stack?: string };
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
  payload: {
    operation: DocumentNode;
    operationName: string | undefined;
    variables: JSONObject | undefined;
    fetchPolicy: FetchPolicy;
  };
};

type ExplorerResponseMessage = {
  type: "explorerResponse";
  payload: ExplorerResponse;
};

type ExplorerSubscriptionTerminationMessage = {
  type: "explorerSubscriptionTermination";
};

export type ClientMessage =
  | { type: "clientRegistered" }
  | { type: "clientTerminated" }
  | { type: "pageUnloaded" }
  | ExplorerRequestMessage
  | ExplorerResponseMessage
  | ExplorerSubscriptionTerminationMessage;

export type PanelMessage =
  | ExplorerRequestMessage
  | ExplorerResponseMessage
  | ExplorerSubscriptionTerminationMessage
  | {
      type: "initializePanel";
      state: StateValues;
      payload: ClientContext;
    }
  | { type: "retryConnection" }
  | { type: "devtoolsStateChanged"; state: StateValues }
  | { type: "update"; payload: ClientContext };

export type DevtoolsRPCMessage = {
  getClientOperations(): ClientContext | null;
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
