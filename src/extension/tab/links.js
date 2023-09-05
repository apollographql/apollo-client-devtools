import { ApolloClient, gql, Observable } from "@apollo/client";

import { buildSchemasFromTypeDefs } from "./typeDefs";

/*
 * Supports dynamic client schemas set on the context;
 * schemas must be an array of the following shape:
 * {
 *    definition: schemaString,
 *    directives: `directive @client on FIELD`,
 * }
 */
const apolloClientSchema = {
  directives: "directive @connection(key: String!, filter: [String]) on FIELD",
};

export const initLinkEvents = (hook, bridge) => {
  // Handle incoming requests
  const subscriber = (request) => {
    const { query, variables, operationName, fetchPolicy } =
      JSON.parse(request);

    try {
      const apolloClient = hook.ApolloClient;
      const userLink = apolloClient.link;
      const cache = apolloClient.cache;
      let operationExecution$;
      const queryAst = gql(query);
      const subscriptionHandlers = {
        next(data) {
          bridge.send(`link:next:${operationName}`, JSON.stringify(data));
        },
        error(err) {
          bridge.send(`link:error:${operationName}`, JSON.stringify(err));
        },
        complete: () => bridge.send(`link:complete:${operationName}`),
      };

      const typeDefs = apolloClient.typeDefs;

      // When using `apollo-link-state`, client supplied typeDefs (for a
      // local only schema) are extracted by re-using the same Apollo Link
      // chain as the application, along with the `schemaLink` mentioned
      // above. When using the local state functionality built directly into
      // Apollo Client however, the logic to extract and store the schema
      // from typeDefs that is contained within `apollo-link-state` is not
      // called. To address this, we'll generate the local schema
      // using typeDefs pulled out of the current AC instance.
      const schemas = buildSchemasFromTypeDefs(typeDefs);

      // Create a new ApolloClient instance (that re-uses parts of the
      // user land application ApolloClient instance) to avoid having
      // devtools IntrospectionQuery's (and potentially other future devtool
      // only queries) show up in the "Queries" panel as watched queries.
      // This means devtools specific queries will use their own query store.
      const apolloClientReplica = new ApolloClient({
        link: userLink,
        cache,
        typeDefs,
        resolvers: apolloClient.getResolvers(),
      });

      if (
        queryAst.definitions &&
        queryAst.definitions.length > 0 &&
        queryAst.definitions[0].operation === "mutation"
      ) {
        operationExecution$ = new Observable((observer) => {
          apolloClientReplica
            .mutate({
              mutation: queryAst,
              variables,
            })
            .then((result) => {
              observer.next(result);
            });
        });
      } else {
        operationExecution$ = apolloClientReplica.watchQuery({
          query: queryAst,
          variables,
          fetchPolicy,
        });
      }

      operationExecution$.subscribe(
        Object.assign({}, subscriptionHandlers, {
          next(data) {
            // `apollo-link-state` gets the local schema added to the result
            // via the `schemaLink`, but Apollo Client local state does not.
            // When using Apollo Client local state, we'll add the schema
            // manually.
            data.extensions = Object.assign({}, data.extensions, {
              schemas: [...(schemas || []), apolloClientSchema],
            });
            bridge.send(`link:next:${operationName}`, JSON.stringify(data));
          },
        })
      );
    } catch (e) {
      bridge.send(`link:error:${operationName}`, JSON.stringify(e));
    }
  };

  bridge.on("link:operation", subscriber);
};
