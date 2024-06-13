import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { Reference, TypedDocumentNode } from "@apollo/client";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  makeVar,
  gql,
} from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";
import { getOperationName } from "@apollo/client/utilities";
import { print } from "graphql/language/printer";

import { colorTheme, listenForThemeChange } from "./theme";
import { App } from "./App";
import { fragmentRegistry } from "./fragmentRegistry";
import * as Tooltip from "@radix-ui/react-tooltip";

import type {
  GetQueries,
  GetQueriesVariables,
  WatchedQuery,
  SerializedApolloError as GQLSerializedApolloError,
  SerializedError as GQLSerializedError,
} from "./types/gql";
import type {
  QueryDetails,
  SerializedApolloError,
  SerializedError,
} from "../extension/tab/helpers";
import type { JSONObject } from "./types/json";
import { getRpcClient } from "../extension/devtools/panelRpcClient";
import { createSchemaWithRpcClient } from "./schema";
import type { ApolloClientInfo } from "../types";

const rpcClient = getRpcClient(window);
const schema = createSchemaWithRpcClient(rpcClient);
const link = new SchemaLink({ schema });

const cache = new InMemoryCache({
  fragments: fragmentRegistry,
  possibleTypes: {
    WatchedMutationError: ["SerializedError", "SerializedApolloError"],
  },
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
    ClientQueries: {
      merge: true,
    },
    ClientMutations: {
      merge: true,
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
export const client = new ApolloClient({ cache, link });

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
          pollInterval
          error {
            message
            clientErrors
            name
            networkError {
              message
              name
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

export function getQueryData(query: QueryDetails): WatchedQuery | undefined {
  // TODO: The current designs do not account for non-cached data.
  // We need a workaround to show that data + we should surface
  // the FetchPolicy.
  const name = getOperationName(query.document);
  if (name === "IntrospectionQuery") {
    return;
  }

  return {
    id: String(query.id),
    __typename: "WatchedQuery",
    name,
    queryString: print(query.document),
    variables: query.variables ?? null,
    cachedData: query.cachedData ?? null,
    options: query.options ?? null,
    networkStatus: (query.networkStatus as number) ?? null,
    pollInterval: query.pollInterval ?? null,
    error: query.error ? toGQLSerializedApolloError(query.error) : null,
  };
}

function toGQLSerializedError(error: SerializedError): GQLSerializedError {
  return {
    ...error,
    stack: error.stack ?? null,
    __typename: "SerializedError",
  };
}

function toGQLSerializedApolloError(
  apolloError: SerializedApolloError
): GQLSerializedApolloError {
  return {
    ...apolloError,
    networkError: apolloError.networkError
      ? toGQLSerializedError(apolloError.networkError)
      : null,
    graphQLErrors: apolloError.graphQLErrors.map((graphQLError) => ({
      __typename: "SerializedGraphQLError",
      path: graphQLError.path ?? null,
      message: graphQLError.message,
      extensions: (graphQLError.extensions as JSONObject) ?? null,
    })),
    __typename: "SerializedApolloError",
  };
}

export const writeData = ({
  clientVersion,
  queries,
  cache,
}: {
  clientVersion: string | null;
  queries: QueryDetails[];
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

export const addClient = (clientData: ApolloClientInfo) => {
  client.cache.modify({
    id: "ROOT_QUERY",
    fields: {
      clients: (clients) => {
        const ref = client.writeFragment({
          fragment: gql`
            fragment ClientFields on Client {
              id
              version
            }
          `,
          id: client.cache.identify({
            __typename: "Client",
            id: clientData.id,
          }),
          data: clientData,
        });

        return ref ? [...clients, ref] : clients;
      },
    },
  });
};

export const removeClient = (clientId: string) => {
  client.cache.modify({
    id: "ROOT_QUERY",
    fields: {
      clients: (clients, { readField }) => {
        return clients.filter(
          (client: Reference) => readField("id", client) !== clientId
        );
      },
    },
  });
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
