import type { SerializedErrorLike } from "./errors";
import { createId } from "@/utils/createId";
import type { ApolloClientDevtoolsActorMessage } from "./actor";
import type {
  RPCRequestMessage,
  RPCResponseMessage,
  RPCStreamChunkMessage,
  RPCStreamStartMessage,
  RPCTerminateStreamMessage,
} from "./rpc";
import type { DistributiveOmit } from "@/types";

export interface PostMessageError {
  source: "apollo-client-devtools";
  type: MessageType.PostMessageError;
  id: string;
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

export type ApolloClientDevtoolsMessage =
  | ApolloClientDevtoolsActorMessage
  | RPCRequestMessage
  | RPCResponseMessage
  | PostMessageError
  | RPCStreamStartMessage
  | RPCTerminateStreamMessage
  | RPCStreamChunkMessage;

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

export function isPostMessageError(
  message: unknown
): message is PostMessageError {
  return (
    isDevtoolsMessage(message) && message.type === MessageType.PostMessageError
  );
}

export function createDevtoolsMessage(
  message: DistributiveOmit<ApolloClientDevtoolsMessage, "id" | "source">
): ApolloClientDevtoolsMessage {
  return { ...message, id: createId(), source: "apollo-client-devtools" };
}
