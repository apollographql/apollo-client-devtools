import type { ApolloClientDevtoolsActorMessage } from "./actor";
import type {
  RPCRequestMessage,
  RPCResponseMessage,
  RPCStreamChunkMessage,
  RPCStreamStartMessage,
  RPCTerminateStreamMessage,
} from "./rpc";

export const enum MessageType {
  RPCRequest = "rpcRequest",
  RPCResponse = "rpcResponse",
  RPCStartStream = "rcpStartStream",
  RPCTerminateStream = "rpcTerminateStream",
  RPCStreamChunk = "rpcStreamChunk",
  Actor = "actor",
}

export type ApolloClientDevtoolsMessage =
  | ApolloClientDevtoolsActorMessage
  | RPCRequestMessage
  | RPCResponseMessage
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
