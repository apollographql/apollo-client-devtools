import { ExplorerResponse } from "../types";

export type ApolloClientDevtoolsMessage = {
  source: "apollo-client-devtools";
  message: Message;
};

export type Message =
  | { type: "clientNotFound" }
  | { type: "connectToClient" }
  | { type: "connectToClientTimeout" }
  | { type: "connectToDevtools"; payload: string }
  | { type: "disconnectFromDevtools" }
  | { type: "explorerRequest"; payload: string }
  | { type: "explorerResponse"; payload: ExplorerResponse }
  | { type: "requestData" }
  | { type: "update"; payload: string };

export function isApolloClientDevtoolsMessage(
  message: unknown
): message is ApolloClientDevtoolsMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    "source" in message &&
    message.source === "apollo-client-devtools"
  );
}
