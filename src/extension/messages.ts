export type ApolloClientDevtoolsMessage = {
  source: "apollo-client-devtools";
  message: Message;
};

export type Message =
  | { type: "connectToClient" }
  | { type: "connectToDevtools"; payload: string }
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
