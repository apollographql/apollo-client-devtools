import type { ApolloClientInfo, SafeAny } from "../types";
import type { JSONObject } from "../application/types/json";
import type { MutationDetails, QueryDetails } from "./tab/helpers";
import type { EventMessage } from "./actor";

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

export type ApolloClientDevtoolsEventMessage = {
  id: string;
  source: "apollo-client-devtools";
  type: MessageType.Event;
  message: EventMessage;
};

export type ApolloClientDevtoolsMessage =
  | ApolloClientDevtoolsEventMessage
  | RPCRequestMessage
  | RPCResponseMessage;

export type DevtoolsRPCMessage = {
  getClients(): ApolloClientInfo[];
  getClient(id: string): ApolloClientInfo | null;
  getQueries(clientId: string): QueryDetails[];
  getMutations(clientId: string): MutationDetails[];
  getCache(clientId: string): JSONObject;
};

export function isDevtoolsMessage(
  message: unknown
): message is ApolloClientDevtoolsMessage {
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

export function isEventMessage(
  message: unknown
): message is ApolloClientDevtoolsEventMessage {
  return isDevtoolsMessage(message) && message.type === MessageType.Event;
}
