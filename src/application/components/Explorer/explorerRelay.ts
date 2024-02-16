import Relay from "../../../Relay";
import { ExplorerResponse, QueryResult, MessageObj } from "../../../types";
import { EXPLORER_RESPONSE } from "../../../extension/constants";
import { EXPLORER_SUBSCRIPTION_TERMINATION } from "./postMessageHelpers";

const explorer = new Relay();

explorer.listen<ExplorerResponse>(EXPLORER_RESPONSE, ({ payload }) => {
  if (payload) {
    explorer.broadcast({
      message: `explorer:response:${payload.operationName}`,
      payload: payload.response,
    });
  }
});

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
  window.dispatchEvent(
    new CustomEvent(EXPLORER_RESPONSE, {
      detail: {
        message: EXPLORER_RESPONSE,
        payload,
      },
    })
  );
};

export const receiveExplorerResponses = (): (() => void) => {
  const handleResponse = ({ detail }: CustomEvent<MessageObj>) => {
    explorer.broadcast(detail);
  };

  window.addEventListener(EXPLORER_RESPONSE, handleResponse);

  return () => {
    window.removeEventListener(EXPLORER_RESPONSE, handleResponse);
  };
};
