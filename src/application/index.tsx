import { useEffect } from "react";
import { createRoot } from 'react-dom/client';
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  makeVar,
  gql,
} from "@apollo/client";
import { getOperationName } from "@apollo/client/utilities";
import { print } from "graphql/language/printer";

import { Theme } from "./ThemeVars";
import { colorTheme, listenForThemeChange } from "./theme";
import { App, reloadStatus } from "./App";

import "@apollo/space-kit/reset.css";

const queryCacheMap = new Map();

const inMemoryCache = new InMemoryCache({
  typePolicies: {
    WatchedQuery: {
      keyFields: ["id", "clientId"],
      fields: {
        name(_) {
          return _ ?? "Unnamed";
        },
        clientId(_) {
          return _
        }
      },
    },
    Mutation: {
      keyFields: ["id", "clientId"],
      fields: {
        name(_) {
          return _ ?? "Unnamed";
        },
        clientId(_) {
          return _
        }
      },
    },
    Client: {
      fields: {
        watchedQueries(_ = { queries: [], count: 0 }) {
          return _;
        },
        mutationLog(_ = { mutations: [], count: 0 }) {
          return _;
        },
        watchedQuery(_, { toReference, variables, canRead }) {
          const ref = toReference({
            __typename: "WatchedQuery",
            id: variables?.id,
            clientId: variables?.clientId
          });

          return canRead(ref) ? ref : _;
        },
        mutation(_, { toReference, variables }) {
          return toReference({
            __typename: "Mutation",
            id: variables?.id,
            clientId: variables?.clientId
          });
        },
        cache(_, { variables }) {
          const cacheVar = queryCacheMap.get(variables?.clientId);
          return cacheVar && cacheVar()
        },
      }
    },
    Query: {
      fields: {
        client: {
          read(_) {
            return _
          }
        },
      },
    },
  },
});

export const client = new ApolloClient({
  cache: inMemoryCache,
});


export const GET_QUERIES = gql`
  query GetQueries($clientId: ID!) {
    client(id: $clientId) @client {
      watchedQueries {
        queries {
          name
          clientId
          queryString
          variables
          cachedData
        }
        count
      }
    }
  }
`;

export const GET_MUTATIONS = gql`
  query GetMutations($clientId: ID!) {
    client(id: $clientId) @client {
      mutationLog {
        mutations {
          name
          clientId
          mutationString
          variables
        }
        count
      }
    }
  }
`;

interface Query {
  id: number;
  name: string | null;
  variables: object;
}

type WatchedQuery = Query & {
  __typename: "WatchedQuery";
  queryString: string;
  cachedData: object;
};

type Mutation = Query & {
  __typename: "Mutation";
  mutationString: string;
};

export function getQueryData(query, key: number): WatchedQuery | undefined {
  if (!query || !query.document) return;
  // TODO: The current designs do not account for non-cached data.
  // We need a workaround to show that data + we should surface
  // the FetchPolicy.
  const name = getOperationName(query?.document);
  if (name === "IntrospectionQuery") {
    return;
  }

  return {
    id: key,
    __typename: "WatchedQuery",
    name,
    queryString: print(query.document),
    variables: query.variables,
    cachedData: query.cachedData,
  };
}

export function getMutationData(mutation, key: number): Mutation | undefined {
  if (!mutation) return;

  return {
    id: key,
    __typename: "Mutation",
    name: getOperationName(mutation?.document),
    mutationString: mutation?.source?.body,
    variables: mutation.variables,
  };
}

export const clients = makeVar<string[]>([])
export const currentClient = makeVar<string | null>(null);

export const writeData = ({ id, queries, mutations, cache }) => {
  const registeredClients = clients();
  if (!registeredClients.includes(id)) {
    clients([...registeredClients, id])
  }

  const filteredQueries: WatchedQuery[] = queries
    .map((q, i: number) => getQueryData(q, i))
    .filter(Boolean)
    .map(data => {
      return { ...data, clientId: id }
    })

  client.writeQuery({
    query: GET_QUERIES,
    data: {
      client: {
        id: id,
        __typename: "Client",
        watchedQueries: {
          queries: filteredQueries,
          count: filteredQueries.length,
        },
      }
    },
    variables: {
      clientId: id
    }
  });

  const mappedMutations: Mutation[] = mutations.map((m, i: number) =>
    getMutationData(m, i)
  )
  .filter(Boolean)
  .map(data => {
    return { ...data, clientId: id }
  })


  client.writeQuery({
    query: GET_MUTATIONS,
    data: {
      client: {
        id,
        __typename: "Client",
        mutationLog: {
          mutations: mappedMutations,
          count: mappedMutations.length,
        },
      }
    },
    variables: {
      clientId: id
    }
  });

  const cacheVar = queryCacheMap.get(id) ?? makeVar(null);
  cacheVar(cache);
  queryCacheMap.set(id, cacheVar)
};

const reset = () => {
  clients([])
  currentClient(null)
  queryCacheMap.clear();
  client.resetStore();
}

export const handleReload = () => {
  reloadStatus(true);
};

export const handleReloadComplete = () => {
  reloadStatus(false);
  reset();
};

export const AppProvider = () => {
  useEffect(() =>
    listenForThemeChange((newColorTheme) => colorTheme(newColorTheme))
  );

  return (
    <ApolloProvider client={client}>
      <App />
      <Theme />
    </ApolloProvider>
  );
};

export const initDevTools = () => {
  const root = createRoot(document.getElementById('devtools') as HTMLElement);

  root.render(<AppProvider />);
};
