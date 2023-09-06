import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  makeVar,
  gql,
  TypedDocumentNode,
} from "@apollo/client";
import { getOperationName } from "@apollo/client/utilities";
import { print } from "graphql/language/printer";

import { Theme } from "./ThemeVars";
import { colorTheme, listenForThemeChange } from "./theme";
import { App, reloadStatus } from "./App";
import { fragmentRegistry } from "./fragmentRegistry";

import "@apollo/space-kit/reset.css";
import {
  GetAllMutations,
  GetAllMutationsVariables,
  GetQueries,
  GetQueriesVariables,
  WatchedMutation,
  WatchedQuery,
} from "./types/gql";
import { QueryInfo } from "../extension/tab/helpers";

const cache = new InMemoryCache({
  fragments: fragmentRegistry,
  typePolicies: {
    WatchedQuery: {
      fields: {
        name(_) {
          return _ ?? "Unnamed";
        },
      },
    },
    WatchedMutation: {
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
            __typename: "WatchedMutation",
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

const cacheVar = makeVar<string | null>(null);
export const client = new ApolloClient({
  cache,
});

export const GET_QUERIES: TypedDocumentNode<
  GetQueries,
  GetQueriesVariables
> = gql`
  query GetQueries {
    watchedQueries @client {
      queries {
        id
        name
        queryString
        variables
        cachedData
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

  return {
    id: key,
    __typename: "WatchedQuery",
    name,
    queryString: print(query.document),
    variables: query.variables ?? null,
    cachedData: query.cachedData ?? null,
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
  queries,
  mutations,
  cache,
}: {
  queries: QueryInfo[];
  mutations: QueryInfo[];
  cache: string;
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
