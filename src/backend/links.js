import { ApolloClient } from "apollo-client";
import { execute, ApolloLink, Observable, from } from "apollo-link";
import gql from "graphql-tag";

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

const schemaLink = () =>
  new ApolloLink((operation, forward) => {
    const obs = forward(operation);
    return obs.map
      ? obs.map(result => {
          let { schemas = [] } = operation.getContext();
          result.extensions = Object.assign({}, result.extensions, {
            schemas: schemas.concat([apolloClientSchema]),
          });
          return result;
        })
      : obs;
  });

// Forward all "errors" to next with a good shape for graphiql
const errorLink = () =>
  new ApolloLink((operation, forward) => {
    return new Observable(observer => {
      let sub;
      try {
        sub = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: networkError => {
            observer.next({
              errors: [
                {
                  message: networkError.message,
                  locations: [networkError.stack],
                },
              ],
            });
          },
          complete: observer.complete.bind(observer),
        });
      } catch (e) {
        observer.next({
          errors: [{ message: e.message, locations: [e.stack] }],
        });
      }

      return () => {
        if (sub) sub.unsubscribe();
      };
    });
  });

const cacheLink = fetchPolicy =>
  new ApolloLink((operation, forward) => {
    if (fetchPolicy === "no-cache") return forward(operation);

    const { cache } = operation.getContext();
    const { variables, query } = operation;
    try {
      const results = cache.readQuery({ query, variables });
      if (results) return Observable.of({ data: results });
    } catch (e) {}

    return forward(operation);
  });

export const initLinkEvents = (hook, bridge) => {
  // Handle incoming requests
  const subscriber = request => {
    const { query, variables, operationName, key, fetchPolicy } = JSON.parse(
      request,
    );

    try {
      const apolloClient = hook.ApolloClient;
      const userLink = apolloClient.link;
      const cache = apolloClient.cache;
      let operationExecution$;
      const queryAst = gql(query);
      const subscriptionHandlers = {
        next(data) {
          bridge.send(`link:next:${key}`, JSON.stringify(data));
        },
        error(err) {
          bridge.send(`link:error:${key}`, JSON.stringify(err));
        },
        complete: () => bridge.send(`link:complete:${key}`),
      };

      // Devtools can currently be used with 2 versions of local state
      // handling: 1) Using `apollo-link-state` or 2) Using local state
      // features integrated directly into Apollo Client. `apollo-link-state`
      // will eventually be deprecated, but for the time being we need to
      // support both approaches via devtools.
      //
      // The `apollo-link-state` approach uses a custom link chain to parse
      // and execute queries, whereas the Apollo Client local state approach
      // uses Apollo Client directly. To decide which approach to use
      // below, we'll check to see if typeDefs have been set on the
      // ApolloClient instance, as if so, this means Apollo Client local state
      // is being used.

      const supportsApolloClientLocalState =
        typeof apolloClient.typeDefs !== "undefined";

      if (!supportsApolloClientLocalState) {
        // Supports `apollo-link-state`.
        const context = { __devtools_key__: key, cache };

        const devtoolsLink = from([
          errorLink(),
          cacheLink(fetchPolicy),
          schemaLink(),
          userLink,
        ]);

        const operationExecution$ = execute(devtoolsLink, {
          query: queryAst,
          variables,
          operationName,
          context,
        });

        operationExecution$.subscribe(subscriptionHandlers);
        return;
      }

      // Supports Apollo Client local state.

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
        operationExecution$ = new Observable(observer => {
          apolloClientReplica
            .mutate({
              mutation: queryAst,
              variables,
            })
            .then(result => {
              observer.next(result);
            });
        });
      } else {
        operationExecution$ = apolloClientReplica.watchQuery({
          query: queryAst,
          variables,
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
              schemas: schemas.concat([apolloClientSchema]),
            });
            bridge.send(`link:next:${key}`, JSON.stringify(data));
          },
        }),
      );
    } catch (e) {
      bridge.send(`link:error:${key}`, JSON.stringify(e));
    }
  };

  bridge.on("link:operation", subscriber);
};
