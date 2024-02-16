import Relay from "../../../Relay";
import { ExplorerResponse, QueryResult } from "../../../types";
import { EXPLORER_SUBSCRIPTION_TERMINATION } from "./postMessageHelpers";

const explorer = new Relay();

export const listenForResponse = (
  cb: (result: QueryResult) => void,
  operationName?: string,
  isSubscription?: boolean
): void => {
  const removeListener = explorer.listen<QueryResult>(
    `explorer:response:${operationName}`,
    ({ payload }) => {
      cb(payload);
      // Queries and Mutation can be closed after a single response comes back,
      // but we need to listen until we are told to stop for Subscriptions
      if (!isSubscription) {
        removeListener();
      } else {
        explorer.listen(EXPLORER_SUBSCRIPTION_TERMINATION, () => {
          removeListener();
        });
      }
    }
  );
};

export const sendResponseToExplorer = ({
  payload,
}: {
  payload: ExplorerResponse;
}): void => {
  if (payload) {
    explorer.broadcast({
      message: `explorer:response:${payload.operationName}`,
      payload: payload.response,
    });
  }
};
