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

export type ApolloClientDevtoolsMessage = DevtoolsMessage & {
  readonly source: "apollo-client-devtools";
  readonly id: string;
};

export type TypeFilter<T extends string> =
  | { includeTypes: readonly T[]; excludeTypes?: never }
  | { excludeTypes: readonly T[]; includeTypes?: never };

export function createTypeFilter<T extends string>(
  options: TypeFilter<T>,
  getType: (message: DevtoolsMessage) => string | undefined
) {
  const types = new Set<string>(options.includeTypes ?? options.excludeTypes);
  const include = options.includeTypes !== undefined;
  return (message: DevtoolsMessage) => {
    const type = getType(message);
    return (type !== undefined && types.has(type)) === include;
  };
}

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
  message: DevtoolsMessage & { id?: string }
): ApolloClientDevtoolsMessage {
  return {
    ...message,
    id: message.id ?? createId(),
    source: "apollo-client-devtools",
  };
}
