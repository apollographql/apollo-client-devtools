import Relay from '../../Relay';
import { GRAPHIQL_REQUEST, GRAPHIQL_DATA } from '../../extension/constants';

export const graphiQL = new Relay();

graphiQL.listen(GRAPHIQL_DATA, message => {
  console.log('graphiQL listening...', message);
});

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
  (window as any).dispatchEvent(new CustomEvent(GRAPHIQL_DATA, { 
    detail: {
      message: GRAPHIQL_DATA,
      payload,
    } 
  }));
};

export const receiveGraphiQLResponses = () => {
  console.log('receiveGraphiQLResponses initialized');
  (window as any).addEventListener(GRAPHIQL_DATA, ({ detail }) => {
    console.log('receiveGraphiQLResponses', detail);
    graphiQL.broadcast(detail);
  });
  return () => {
    (window as any).removeEventListener(GRAPHIQL_DATA, graphiQL.broadcast);
  };
};
