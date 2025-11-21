import type { SerializedErrorLike } from "./errors";
import type { ApolloClientDevtoolsActorMessage } from "./actor";
import type { RPCRequestMessage, RPCResponseMessage } from "./rpc";

export interface PostMessageError {
  source: "apollo-client-devtools";
  type: MessageType.PostMessageError;
  id: string;
  error: SerializedErrorLike;
}

export const enum MessageType {
  RPCRequest = "rpcRequest",
  RPCResponse = "rpcResponse",
  Actor = "actor",
  PostMessageError = "postMessageError",
}

export type ApolloClientDevtoolsMessage =
  | ApolloClientDevtoolsActorMessage
  | RPCRequestMessage
  | RPCResponseMessage
  | PostMessageError;

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
