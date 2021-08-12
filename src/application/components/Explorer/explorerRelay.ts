import Relay from "../../../Relay";
import { ExplorerResponse, QueryResult, MessageObj } from "../../../types";
import {
  EXPLORER_RESPONSE,
  EXPLORER_REQUEST,
  SUBSCRIPTION_TERMINATION,
} from "../../../extension/constants";

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
  operationName: string,
  isSubscription: boolean,
  cb: (p) => void
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
        explorer.listen(SUBSCRIPTION_TERMINATION, () => {
          removeListener();
        });
      }
    }
  );
};

export const sendSubscriptionTerminationRequest = (): void => {
  window.dispatchEvent(
    new CustomEvent(SUBSCRIPTION_TERMINATION, {
      detail: {
        message: SUBSCRIPTION_TERMINATION,
        payload: undefined,
      },
    })
  );
};

export const sendExplorerRequest = (operation: string): void => {
  window.dispatchEvent(
    new CustomEvent(EXPLORER_REQUEST, {
      detail: {
        message: EXPLORER_REQUEST,
        payload: operation,
      },
    })
  );
};

export const receiveExplorerRequests = (callback: () => void): (() => void) => {
  window.addEventListener(EXPLORER_REQUEST, callback);
  return () => {
    window.removeEventListener(EXPLORER_REQUEST, callback);
  };
};

export const receiveSubscriptionTerminationRequest = (
  callback: () => void
): (() => void) => {
  window.addEventListener(SUBSCRIPTION_TERMINATION, callback);
  return () => {
    window.removeEventListener(SUBSCRIPTION_TERMINATION, callback);
  };
};

export const sendResponseToExplorer = ({
  payload,
}: {
  payload: string;
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
