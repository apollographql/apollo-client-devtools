import type { SerializedErrorLike } from "./errors";
import { createId } from "@/utils/createId";
import type { ActorDevtoolsMessage } from "./actor";
import type {
  RPCRequestMessage,
  RPCResponseMessage,
  RPCStreamChunkMessage,
  RPCStreamStartMessage,
  RPCTerminateStreamMessage,
} from "./rpc";

export interface PostMessageError {
  type: MessageType.PostMessageError;
  sourceId: string;
  error: SerializedErrorLike;
}

export const enum MessageType {
  RPCRequest = "rpcRequest",
  RPCResponse = "rpcResponse",
  RPCStartStream = "rpcStartStream",
  RPCTerminateStream = "rpcTerminateStream",
  RPCStreamChunk = "rpcStreamChunk",
  Actor = "actor",
  AggregateResponse = "aggregateResponse",
  PostMessageError = "postMessageError",
  CloseMessagePort = "closeMessagePort",
  ConnectClient = "connectClient",
  DisconnectClient = "disconnectClient",
}

export type DevtoolsMessage =
  | ActorDevtoolsMessage
  | AggregateResponse
  | CloseMessagePortMessage
  | ConnectClientMessage
  | DisconnectClientMessage
  | RPCRequestMessage
  | RPCResponseMessage
  | PostMessageError
  | RPCStreamStartMessage
  | RPCTerminateStreamMessage
  | RPCStreamChunkMessage;

export type MessageTarget =
  | { type: "client"; clientId: string }
  | { type: "aggregate"; id: string };

export interface ConnectClientMessage {
  type: MessageType.ConnectClient;
  clientId: string;
}

export interface DisconnectClientMessage {
  type: MessageType.DisconnectClient;
  clientId: string;
}

export interface CloseMessagePortMessage {
  type: MessageType.CloseMessagePort;
}

export interface AggregateResponse<
  Result extends DevtoolsMessage = DevtoolsMessage,
> {
  type: MessageType.AggregateResponse;
  target: Extract<MessageTarget, { type: "aggregate" }>;
  results: Array<Result>;
}

export type ApolloClientDevtoolsMessage = DevtoolsMessage & {
  readonly source: "apollo-client-devtools";
  readonly id: string;
  readonly target?: MessageTarget;
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

export function createDevtoolsMessage(
  message: DevtoolsMessage & {
    id?: string;
    clientId?: string;
    target?: MessageTarget;
  }
): ApolloClientDevtoolsMessage {
  return {
    ...message,
    id: message.id ?? createId(),
    source: "apollo-client-devtools",
  } as ApolloClientDevtoolsMessage;
}
