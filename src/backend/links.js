import { execute, ApolloLink } from "apollo-link";
import gql from "graphql-tag";

export const initLinkEvents = (hook, bridge) => {
  const link = hook.ApolloClient.link;
  const cache = hook.ApolloClient.cache;

  const cachelink = new ApolloLink((operation, forward) => {
    // XXX get some data from links here?
    // add cache to link chain like AC does
    operation.setContext({ cache });
    return forward(operation);
  });
  const devtoolsLink = cachelink.concat(link);

  // handle incoming requests
  const subscriber = request => {
    const { query, variables, operationName, key } = JSON.parse(request);
    try {
      const obs = execute(devtoolsLink, {
        query: gql(query),
        variables,
        operationName,
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
