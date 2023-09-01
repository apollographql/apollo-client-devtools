import { useEffect } from "react";
import { createRoot } from "react-dom/client";
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

const cache = new InMemoryCache({
  typePolicies: {
    WatchedQuery: {
      fields: {
        name(_) {
          return _ ?? "Unnamed";
        },
      },
    },
    Mutation: {
      fields: {
        name(_) {
          return _ ?? "Unnamed";
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
            __typename: "Mutation",
            id: args?.id,
          });
        },
        cache() {
          return cacheVar();
        },
      },
    },
  },
});

const cacheVar = makeVar(null);
export const client = new ApolloClient({
  cache,
});

export const GET_QUERIES = gql`
  query GetQueries {
    watchedQueries @client {
      queries {
        name
        queryString
        variables
        cachedData
      }
      count
    }
  }
`;

export const GET_MUTATIONS = gql`
  query GetMutations {
    mutationLog @client {
      mutations {
        name
        mutationString
        variables
      }
      count
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

export const writeData = ({ queries, mutations, cache }) => {
  const filteredQueries: WatchedQuery[] = queries
    .map((q, i: number) => getQueryData(q, i))
    .filter(Boolean);

  client.writeQuery({
    query: GET_QUERIES,
    data: {
      watchedQueries: {
        queries: filteredQueries,
        count: filteredQueries.length,
      },
    },
  });

  const mappedMutations: Mutation[] = mutations.map((m, i: number) =>
    getMutationData(m, i)
  );

  client.writeQuery({
    query: GET_MUTATIONS,
    data: {
      mutationLog: {
        mutations: mappedMutations,
        count: mappedMutations.length,
      },
    },
  });
  cacheVar(cache);
};

export const handleReload = () => {
  reloadStatus(true);
};

export const handleReloadComplete = () => {
  reloadStatus(false);
  client.resetStore();
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
  const root = createRoot(document.getElementById("devtools") as HTMLElement);

  root.render(<AppProvider />);
};
