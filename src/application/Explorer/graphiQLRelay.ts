import Relay from '../../Relay';
import { GRAPHIQL_REQUEST, GRAPHIQL_RESPONSE } from '../../extension/constants';

const graphiQL = new Relay();

graphiQL.listen(GRAPHIQL_RESPONSE, ({ detail: { payload } }) => {
  graphiQL.broadcast({
    message: `graphiql:response:${payload.operationName}`,
    payload: payload.response,
  });
});

export const listenForResponse = (operationName: string, cb: (p) => void) => {
  const removeListener = graphiQL.listen(`graphiql:response:${operationName}`, ({ detail: { payload } }) => {
    cb(payload);
    removeListener();
  });
};

export const sendGraphiQLRequest = operation => {
  (window as any).dispatchEvent(new CustomEvent(GRAPHIQL_REQUEST, { 
    detail: {
      message: GRAPHIQL_REQUEST,
      payload: operation,
    } 
  }));
};

export const receiveGraphiQLRequests = callback => {
  (window as any).addEventListener(GRAPHIQL_REQUEST, callback);
  return () => {
    (window as any).removeEventListener(GRAPHIQL_REQUEST, callback);
  };
};

export const sendResponseToGraphiQL = ({ payload }) => {
  (window as any).dispatchEvent(new CustomEvent(GRAPHIQL_RESPONSE, { 
    detail: {
      message: GRAPHIQL_RESPONSE,
      payload,
    } 
  }));
};

export const receiveGraphiQLResponses = () => {
  (window as any).addEventListener(GRAPHIQL_RESPONSE, ({ detail }) => {
    graphiQL.broadcast(detail);
  });
  return () => {
    (window as any).removeEventListener(GRAPHIQL_RESPONSE, graphiQL.broadcast);
  };
};
