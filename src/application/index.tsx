/** @jsx jsx */
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
import { Explorer } from './Explorer/Explorer';

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        watchedQuery(_, { toReference, variables }) {
          return toReference({
            __typename: 'WatchedQuery',
            id: variables?.id,
          });
        },
        mutations() {
          return mutationsVar();
        },
        cache() {
          return cacheVar();
        },
        graphiQLQuery() {
          return graphiQLQuery();
        },
      }
    }
  }
});

const mutationsVar = makeVar(null);
const cacheVar = makeVar(null);
export const colorTheme = makeVar<ColorTheme>(ColorTheme.Light);
export const graphiQLQuery = makeVar<string>('');

export const client = new ApolloClient({
  cache,
});

const GET_QUERIES = gql`
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

function getQueryData(query, key) {
  if (!query) return;
  console.log(query);
  // TODO: The current designs do not account for non-cached data.
  // We need a workaround to show that data + we should surface
  // the FetchPolicy.
  return {
    id: key,
    __typename: 'WatchedQuery',
    name: getOperationName(query?.document),
    queryString: query?.source?.body,
    variables: query.lastWrittenVars,
    cachedData: query.lastWrittenResult,
  }
}

export const writeData = ({ queries, mutations, cache }) => {
  client.writeQuery({
    query: GET_QUERIES,
    // data: { watchedQueries: queries.map((q, i) => getQueryData(q, i)) },
    data: { watchedQueries: {
      queries: queries.map((q, i) => getQueryData(q, i)),
      count: queries.length,
    }},
  });

  mutationsVar(mutations);
  cacheVar(cache);
};

const screens = {
  [Screens.Explorer]: Explorer,
  [Screens.Queries]: Queries,
  [Screens.Mutations]: Mutations,
  [Screens.Cache]: () => <div>Cache</div>
};

const GET_QUERIES_COUNT = gql`
  query GetQueriesCount {
    watchedQueries @client {
      count
    }
  }
`;

const App = () => {
  const { data } = useQuery(GET_QUERIES_COUNT );
  const theme = useReactiveVar<ColorTheme>(colorTheme);
  const selected = useReactiveVar<Screens>(currentScreen);
  const Screen = screens[selected];

  return (
    <ThemeProvider theme={themes[theme]}>
      <Screen
        navigationProps={{ 
          queriesCount: data?.watchedQueries?.count,
          mutationsCount: 0,
        }}
      />
    </ThemeProvider>
  )
};

export const initDevTools = () => {
  render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
    document.getElementById("app")
  );
};
