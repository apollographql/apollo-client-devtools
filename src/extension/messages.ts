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
  PostMessageError = "postMessageError",
}

export type DevtoolsMessage =
  | ActorDevtoolsMessage
  | RPCRequestMessage
  | RPCResponseMessage
  | PostMessageError
  | RPCStreamStartMessage
  | RPCTerminateStreamMessage
  | RPCStreamChunkMessage;

export type MessageTarget = { type: "client"; clientId: string };

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
  },
  target?: MessageTarget
): ApolloClientDevtoolsMessage {
  return {
    ...message,
    target: target ?? message.target,
    id: message.id ?? createId(),
    source: "apollo-client-devtools",
  };
}
