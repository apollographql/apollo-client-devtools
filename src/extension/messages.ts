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

type ExplorerRequestMessage = {
  type: "explorerRequest";
  payload: string;
};

type ExplorerResponseMessage = {
  type: "explorerResponse";
  payload: ExplorerResponse;
};

type ExplorerSubscriptionTerminationMessage = {
  type: "explorerSubscriptionTermination";
};

export type ClientMessage =
  | { type: "clientNotFound" }
  | { type: "connectToClient" }
  | { type: "connectToClientTimeout" }
  | {
      type: "connectToDevtools";
      payload: GetContext<DevtoolsMachine>["clientContext"];
    }
  | { type: "disconnectFromDevtools" }
  | ExplorerRequestMessage
  | ExplorerResponseMessage
  | ExplorerSubscriptionTerminationMessage
  | { type: "requestData" }
  | { type: "update"; payload: GetContext<DevtoolsMachine>["clientContext"] }
  | ClientDevtoolsMessage;

export type PanelMessage =
  | ExplorerRequestMessage
  | ExplorerResponseMessage
  | ExplorerSubscriptionTerminationMessage
  | {
      type: "initializePanel";
      state: GetStates<DevtoolsMachine>;
      payload: GetContext<DevtoolsMachine>["clientContext"];
    }
  | { type: "retryConnection" }
  | { type: "devtoolsStateChanged"; state: GetStates<DevtoolsMachine> }
  | { type: "update"; payload: GetContext<DevtoolsMachine>["clientContext"] }
  | ClientDevtoolsMessage;

// Messages sent from the Apollo Client instance to the devtools
export type ClientDevtoolsMessage =
  | {
      type: "reactiveVar.register";
      payload: {
        displayName: string | undefined;
        value: unknown;
      };
    }
  | { type: "reactiveVar.update"; payload: { id: number; value: unknown } };

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
