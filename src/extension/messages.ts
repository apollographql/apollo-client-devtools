import { ExplorerResponse } from "../types";
import { GetStates, GetContext } from "../application/stateMachine";
import { DevtoolsMachine } from "../application/machines";

export interface MessageFormat {
  type: string;
  [key: string]: unknown;
}

export type ApolloClientDevtoolsMessage<
  Message extends Record<string, unknown>,
> = {
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
  | { type: "update"; payload: GetContext<DevtoolsMachine>["clientContext"] };

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
  | { type: "update"; payload: GetContext<DevtoolsMachine>["clientContext"] };

export function isApolloClientDevtoolsMessage<
  Message extends Record<string, unknown>,
>(message: unknown): message is ApolloClientDevtoolsMessage<Message> {
  return (
    typeof message === "object" &&
    message !== null &&
    "source" in message &&
    message.source === "apollo-client-devtools"
  );
}
