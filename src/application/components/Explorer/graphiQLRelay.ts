import Relay from "../../../Relay";
import { GraphiQLResponse, QueryResult, MessageObj } from "../../../types";
import {
  GRAPHIQL_REQUEST,
  GRAPHIQL_RESPONSE,
} from "../../../extension/constants";

const graphiQL = new Relay();

graphiQL.listen<GraphiQLResponse>(GRAPHIQL_RESPONSE, ({ payload }) => {
  if (payload) {
    graphiQL.broadcast({
      message: `graphiql:response:${payload.operationName}`,
      payload: payload.response,
    });
  }
});

export const listenForResponse = (operationName: string, cb: (p) => void) => {
  const removeListener = graphiQL.listen<QueryResult>(
    `graphiql:response:${operationName}`,
    ({ payload }) => {
      cb(payload);
      removeListener();
    }
  );
};

export const sendGraphiQLRequest = (operation) => {
  window.dispatchEvent(
    new CustomEvent(GRAPHIQL_REQUEST, {
      detail: {
        message: GRAPHIQL_REQUEST,
        payload: operation,
      },
    })
  );
};

export const receiveGraphiQLRequests = (callback) => {
  window.addEventListener(GRAPHIQL_REQUEST, callback);
  return () => {
    window.removeEventListener(GRAPHIQL_REQUEST, callback);
  };
};

export const sendResponseToGraphiQL = ({ payload }) => {
  window.dispatchEvent(
    new CustomEvent(GRAPHIQL_RESPONSE, {
      detail: {
        message: GRAPHIQL_RESPONSE,
        payload,
      },
    })
  );
};

export const receiveGraphiQLResponses = () => {
  const handleResponse = ({ detail }: CustomEvent<MessageObj>) => {
    graphiQL.broadcast(detail);
  };

  window.addEventListener(GRAPHIQL_RESPONSE, handleResponse);

  return () => {
    window.removeEventListener(GRAPHIQL_RESPONSE, handleResponse);
  };
};
