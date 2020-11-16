/** @jsx jsx */
import { useEffect } from "react";
import { jsx } from "@emotion/core";
import { ThemeProvider } from "emotion-theming";
import { render } from "react-dom";
import { ApolloClient, ApolloProvider, InMemoryCache, useReactiveVar, makeVar, gql, useQuery } from "@apollo/client";
import { getOperationName } from "@apollo/client/utilities";
import "@apollo/space-kit/reset.css";

import { themes, ColorTheme } from './theme';
import { currentScreen, Screens } from './Layouts/Navigation';
import { Queries } from './Queries/Queries';
import { Mutations } from './Mutations/Mutations';
import { Explorer, resetGraphiQLVars } from './Explorer/Explorer';

const cache = new InMemoryCache({
  typePolicies: {
    WatchedQuery: {
      fields: {
        name(_) {
          return _ ?? 'Unnamed';
        }
      },
    },
    Mutation: {
      fields: {
        name(_) {
          return _ ?? 'Unnamed';
        }
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
            __typename: 'WatchedQuery',
            id: args?.id,
          });
          
          return canRead(ref) ? ref : _;
        },
        mutation(_, { toReference, args }) {
          return toReference({
            __typename: 'Mutation',
            id: args?.id,
          });
        },
        cache() {
          return cacheVar();
        }
      }
    }
  }
});

export const reloadStatus = makeVar<boolean>(false);
const cacheVar = makeVar(null);
export const colorTheme = makeVar<ColorTheme>(ColorTheme.Light);

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

function getQueryData(query, key: number) {
  if (!query) return;
  // TODO: The current designs do not account for non-cached data.
  // We need a workaround to show that data + we should surface
  // the FetchPolicy.
  return {
    id: key,
    __typename: 'WatchedQuery',
    name: getOperationName(query?.document),
    queryString: query?.source?.body,
    variables: query.variables,
    cachedData: query.cachedData,
  }
}

function getMutationData(mutation, key: number) {
  if (!mutation) return;

  return {
    id: key,
    __typename: 'Mutation',
    name: getOperationName(mutation?.document),
    mutationString: mutation?.source?.body,
    variables: mutation.variables,
  }
}


export const writeData = ({ queries, mutations, cache }) => {
  client.writeQuery({
    query: GET_QUERIES,
    data: { 
      watchedQueries: {
        queries: queries.map((q, i: number) => getQueryData(q, i)),
        count: queries.length,
      }
    },
  });

  client.writeQuery({
    query: GET_MUTATIONS,
    data: { 
      mutationLog: {
        mutations: mutations.map((m, i: number) => getMutationData(m, i)),
        count: mutations.length,
      }
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
  resetGraphiQLVars();
};

const screens = {
  [Screens.Explorer]: Explorer,
  [Screens.Queries]: Queries,
  [Screens.Mutations]: Mutations,
  [Screens.Cache]: () => <div>Cache</div>
};

const GET_OPERATION_COUNTS = gql`
  query GetOperationCounts {
    watchedQueries @client {
      count
    }
    mutationLog @client {
      count
    }
  }
`;

export const App = () => {
  const { data } = useQuery(GET_OPERATION_COUNTS);
  const selected = useReactiveVar<Screens>(currentScreen);
  const reloading = useReactiveVar<boolean>(reloadStatus);
  let Screen = screens[selected];

  // During a reload, reset the current screen to Queries.
  useEffect(() => {
    if (reloading && selected !== Screens.Queries) {
      currentScreen(Screens.Queries);
    }
  }, [reloading]);

  if (reloading) {
    return <div></div>;
  }

  return (  
    <Screen
      navigationProps={{ 
        queriesCount: data?.watchedQueries?.count,
        mutationsCount: data?.mutationLog?.count,
      }}
    />
  )
};

const AppProvider = () => {
  const theme = useReactiveVar<ColorTheme>(colorTheme);

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={themes[theme]}>
        <App />
      </ThemeProvider>
    </ApolloProvider>
  );
};

export const initDevTools = () => {
  render(<AppProvider />,
    document.getElementById("devtools")
  );
};
