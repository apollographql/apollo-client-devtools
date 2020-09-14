import Relay from '../../Relay';
import { GRAPHIQL_REQUEST, GRAPHIQL_RESPONSE } from '../../extension/constants';
import { operationName } from '@apollo/client';

export const graphiQL = new Relay();

graphiQL.listen(GRAPHIQL_RESPONSE, ({ detail: { payload } }) => {
  console.log('graphiQL listening...', payload);
  graphiQL.broadcast({
    message: `graphiql:response:${payload.operationName}`,
    payload,
  });
});

export const listenForResponse = (operationName: string, observer) => {
  return graphiQL.listen(`graphiql:response:${operationName}`, response => {
    console.log('listenForResponse', response);
    observer.complete();
  });
};

export const sendGraphiQLRequest = operation => {
  console.log('send to devtools', operation);
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
  console.log('devtools sending', payload);
  (window as any).dispatchEvent(new CustomEvent(GRAPHIQL_RESPONSE, { 
    detail: {
      message: GRAPHIQL_RESPONSE,
      payload,
    } 
  }));
};

export const receiveGraphiQLResponses = () => {
  console.log('receiveGraphiQLResponses initialized');
  (window as any).addEventListener(GRAPHIQL_RESPONSE, ({ detail }) => {
    console.log('receiveGraphiQLResponses', detail);
    graphiQL.broadcast(detail);
  });
  return () => {
    (window as any).removeEventListener(GRAPHIQL_RESPONSE, graphiQL.broadcast);
  };
};
