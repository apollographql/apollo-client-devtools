import type { SafeAny } from "../types";
import type { ApolloClientDevtoolsActorMessage } from "./actor";

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

export type ApolloClientDevtoolsMessage =
  | ApolloClientDevtoolsActorMessage
  | RPCRequestMessage
  | RPCResponseMessage;

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
