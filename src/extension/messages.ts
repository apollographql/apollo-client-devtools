import { ExplorerResponse } from "../types";
import { GetStates, GetContext } from "../application/stateMachine";
import { DevtoolsMachine } from "../application/machines";

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

export type PanelMessage =
  | { type: "explorerResponse"; payload: ExplorerResponse }
  | {
      type: "initializePanel";
      state: GetStates<DevtoolsMachine>;
      payload: GetContext<DevtoolsMachine>["clientContext"];
    }
  | { type: "retryConnection" }
  | { type: "devtoolsStateChanged"; state: GetStates<DevtoolsMachine> }
  | { type: "update"; payload: GetContext<DevtoolsMachine>["clientContext"] };

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
