import { ExplorerResponse } from "../types";

export interface MessageFormat {
  type: string;
}

export type ApolloClientDevtoolsMessage<Message extends MessageFormat> = {
  source: "apollo-client-devtools";
  message: Message;
};

export type DevtoolsMessage =
  | { type: "clientNotFound" }
  | { type: "connectToClient" }
  | { type: "connectToClientTimeout" }
  | { type: "connectToDevtools"; payload: string }
  | { type: "disconnectFromDevtools" }
  | { type: "explorerRequest"; payload: string }
  | { type: "explorerResponse"; payload: ExplorerResponse }
  | { type: "explorerSubscriptionTermination" }
  | { type: "requestData" }
  | { type: "update"; payload: string };

export function isApolloClientDevtoolsMessage<Message extends MessageFormat>(
  message: unknown
): message is ApolloClientDevtoolsMessage<Message> {
  return (
    typeof message === "object" &&
    message !== null &&
    "source" in message &&
    message.source === "apollo-client-devtools"
  );
}
