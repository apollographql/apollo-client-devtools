import { execute, ApolloLink, Observable, from } from "apollo-link";
import gql from "graphql-tag";

const dummySchema = `
  type Todo {
    id: String
    message: String
  }

  type Query {
    todo(id: String!): Todo
  }
`;

const schemaLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(result => {
    result.extensions = Object.assign(result.extensions, {
      schemas: [
        {
          location: "state-link",
          definition: dummySchema,
          directives: `directive @client on FIELD`,
        },
      ],
    });
    return result;
  });
});

// forward all "errors" to next with a good shape for graphiql
const errorLink = new ApolloLink((operation, forward) => {
  return new Observable(observer => {
    let sub;
    try {
      sub = forward(operation).subscribe({
        next: observer.next.bind(observer),
        error: networkError =>
          observer.next({
            errors: [
              {
                message: networkError.message,
                locations: [networkError.stack],
              },
            ],
          }),
        complete: observer.complete.bind(observer),
      });
    } catch (e) {
      observer.next({ errors: [{ message: e.message, locations: [e.stack] }] });
    }

    return () => {
      if (sub) sub.unsubscribe();
    };
  });
});

export const initLinkEvents = (hook, bridge) => {
  const userLink = hook.ApolloClient.link;
  const cache = hook.ApolloClient.cache;

  const devtoolsLink = from([errorLink, schemaLink, userLink]);

  // handle incoming requests
  const subscriber = request => {
    const { query, variables, operationName, key } = JSON.parse(request);
    try {
      const obs = execute(devtoolsLink, {
        query: gql(query),
        variables,
        operationName,
        context: { __devtools_key__: key, cache },
      });
      obs.subscribe({
        next: data => bridge.send(`link:next:${key}`, JSON.stringify(data)),
        error: err => bridge.send(`link:error:${key}`, JSON.stringify(err)),
        complete: () => bridge.send(`link:complete:${key}`),
      });
    } catch (e) {
      bridge.send(`link:error:${key}`, JSON.stringify(e));
    }
  };

  bridge.on("link:operation", subscriber);
};
