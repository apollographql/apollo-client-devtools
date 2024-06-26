import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { TypedDocumentNode } from "@apollo/client";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  makeVar,
  gql,
} from "@apollo/client";
import { getOperationName } from "@apollo/client/utilities";
import { print } from "graphql/language/printer";

import { colorTheme, listenForThemeChange } from "./theme";
import { App } from "./App";
import { fragmentRegistry } from "./fragmentRegistry";
import * as Tooltip from "@radix-ui/react-tooltip";

import type {
  GetAllMutations,
  GetAllMutationsVariables,
  GetQueries,
  GetQueriesVariables,
  WatchedMutation,
  WatchedQuery,
} from "./types/gql";
import type { QueryInfo } from "../extension/tab/helpers";
import type { JSONObject } from "./types/json";

const cache = new InMemoryCache({
  fragments: fragmentRegistry,
  typePolicies: {
    WatchedQuery: {
      fields: {
        name(_) {
          return _ ?? "(anonymous)";
        },
      },
    },
    WatchedMutation: {
      fields: {
        name(_) {
          return _ ?? "(anonymous)";
        },
      },
    },
    Query: {
      fields: {
        watchedQueries(_ = { queries: [], count: 0 }) {
          return _;
        },
        mutationLog(_ = { mutations: [], count: 0 }) {
          return _;
        },
        watchedQuery(_, { toReference, args, canRead }) {
          const ref = toReference({
            __typename: "WatchedQuery",
            id: args?.id,
          });

          return canRead(ref) ? ref : _;
        },
        mutation(_, { toReference, args }) {
          return toReference({
            __typename: "WatchedMutation",
            id: args?.id,
          });
        },
        cache() {
          return cacheVar();
        },
      },
    },
    SerializedApolloError: {
      keyFields: false,
    },
    SerializedGraphQLError: {
      keyFields: false,
    },
  },
});

const cacheVar = makeVar<string | null>(null);
export const client = new ApolloClient({
  cache,
});

export const GET_QUERIES: TypedDocumentNode<GetQueries, GetQueriesVariables> =
  gql`
    query GetQueries {
      watchedQueries @client {
        queries {
          id
          name
          queryString
          variables
          cachedData
          options
          networkStatus
          error {
            message
            clientErrors
            name
            networkError {
              message
              stack
            }
            graphQLErrors {
              message
              path
              extensions
            }
            protocolErrors
          }
        }
        count
      }
    }
  `;

export const GET_MUTATIONS: TypedDocumentNode<
  GetAllMutations,
  GetAllMutationsVariables
> = gql`
  query GetAllMutations {
    mutationLog @client {
      mutations {
        id
        name
        mutationString
        variables
      }
      count
    }
  }
`;

export function getQueryData(
  query: QueryInfo,
  key: number
): WatchedQuery | undefined {
  // TODO: The current designs do not account for non-cached data.
  // We need a workaround to show that data + we should surface
  // the FetchPolicy.
  const name = getOperationName(query.document);
  if (name === "IntrospectionQuery") {
    return;
  }

  const { error } = query;
  const networkError = error?.networkError;

  return {
    id: key,
    __typename: "WatchedQuery",
    name,
    queryString: print(query.document),
    variables: query.variables ?? null,
    cachedData: query.cachedData ?? null,
    options: query.options ?? null,
    networkStatus: (query.networkStatus as number) ?? null,
    error: error
      ? {
          __typename: "SerializedApolloError",
          message: error.message,
          name: error.name,
          clientErrors: error.clientErrors,
          networkError: networkError
            ? {
                __typename: "SerializedError",
                message: networkError.message,
                stack: networkError.stack ?? null,
              }
            : null,
          protocolErrors: error.protocolErrors,
          graphQLErrors: error.graphQLErrors.map((graphQLError) => ({
            __typename: "SerializedGraphQLError",
            path: graphQLError.path ?? null,
            message: graphQLError.message,
            extensions: (graphQLError.extensions as JSONObject) ?? null,
          })),
        }
      : null,
  };
}

export function getMutationData(
  mutation: QueryInfo,
  key: number
): WatchedMutation {
  return {
    id: key,
    __typename: "WatchedMutation",
    name: getOperationName(mutation.document),
    mutationString: print(mutation.document),
    variables: mutation.variables ?? null,
  };
}

export const writeData = ({
  clientVersion,
  queries,
  mutations,
  cache,
}: {
  clientVersion: string | null;
  queries: QueryInfo[];
  mutations: QueryInfo[];
  cache: JSONObject;
}) => {
  const filteredQueries = queries.map(getQueryData).filter(Boolean);

  client.writeQuery({
    query: GET_QUERIES,
    data: {
      watchedQueries: {
        __typename: "WatchedQueries",
        queries: filteredQueries,
        count: filteredQueries.length,
      },
    },
  });

  const mappedMutations = mutations.map(getMutationData);

  client.writeQuery({
    query: GET_MUTATIONS,
    data: {
      mutationLog: {
        __typename: "MutationLog",
        mutations: mappedMutations,
        count: mappedMutations.length,
      },
    },
  });

  client.writeQuery({
    query: gql`
      query ClientVersion {
        clientVersion @client
      }
    `,
    data: {
      clientVersion,
    },
  });

  cacheVar(JSON.stringify(cache));
};

export const AppProvider = () => {
  useEffect(() =>
    listenForThemeChange((newColorTheme) => colorTheme(newColorTheme))
  );

  return (
    <Tooltip.Provider delayDuration={0}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </Tooltip.Provider>
  );
};

export const initDevTools = () => {
  const root = createRoot(document.getElementById("devtools") as HTMLElement);

  root.render(<AppProvider />);
};
