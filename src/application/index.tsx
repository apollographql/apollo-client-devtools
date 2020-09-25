/** @jsx jsx */
import { useState } from "react";
import { jsx } from "@emotion/core";
import { ThemeProvider } from "emotion-theming";
import { render } from "react-dom";
import { ApolloClient, ApolloProvider, InMemoryCache, useQuery, gql, makeVar } from "@apollo/client";
import "@apollo/space-kit/reset.css";
import { colors } from "@apollo/space-kit/colors";

import { Screens } from './Layouts/Navigation';
import { Queries } from './Queries/Queries';
import { Explorer } from './Explorer/Explorer';

export enum ColorTheme {
  Light = 'light',
  Dark = 'dark'
}

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        queries() {
          return queriesVar();
        },
        mutations() {
          return mutationsVar();
        },
        cache() {
          return cacheVar();
        },
        colorTheme() {
          return colorTheme();
        },
        graphiQLQuery() {
          return graphiQLQuery();
        },
      }
    }
  }
});

const queriesVar = makeVar(null);
const mutationsVar = makeVar(null);
const cacheVar = makeVar(null);
export const colorTheme = makeVar<ColorTheme>(ColorTheme.Light);
export const graphiQLQuery = makeVar<string>('');

export const client = new ApolloClient({
  cache,
});

export const writeData = ({ queries, mutations, cache }) => {
  queriesVar(queries);
  mutationsVar(mutations);
  cacheVar(cache);
};

const GET_THEME = gql`
  query GetTheme {
    colorTheme @client
  }
`;

const themes = {
  [ColorTheme.Light]: {
    primary: colors.indigo.darkest
  },
  [ColorTheme.Dark]: {
    primary: colors.black.base
  },
};

const screens = {
  explorer: Explorer,
  queries: Queries,
  mutations: () => (<div>Mutations</div>),
  cache: () => (<div>Cache</div>),
};

const App = () => {
  const { data = { colorTheme: ColorTheme.Light } } = useQuery(GET_THEME);
  const [selectedNavItem, setSelectedNavItem] = useState<Screens>(Screens.Queries);
  const Screen = screens[selectedNavItem] as any;

  return (
    <ThemeProvider theme={themes[data.colorTheme]}>
      <Screen
        navigationProps={{ 
          queriesCount: 0,
          mutationsCount: 100000,
          selected: selectedNavItem,
          onNavigate: setSelectedNavItem,
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
