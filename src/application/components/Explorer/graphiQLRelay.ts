import Relay from "../../../Relay";
import { ExplorerResponse, QueryResult, MessageObj } from "../../../types";
import {
  EXPLORER_RESPONSE,
  EXPLORER_REQUEST,
} from "../../../extension/constants";

const explorer = new Relay();

explorer.listen<ExplorerResponse>(EXPLORER_RESPONSE, ({ payload }) => {
  if (payload) {
    explorer.broadcast({
      message: `graphiql:response:${payload.operationName}`,
      payload: payload.response,
    });
  }
});

export const listenForResponse = (
  operationName: string,
  cb: (p) => void
): void => {
  const removeListener = explorer.listen<QueryResult>(
    `graphiql:response:${operationName}`,
    ({ payload }) => {
      cb(payload);
      removeListener();
    }
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
