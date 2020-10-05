/** @jsx jsx */
import { jsx } from "@emotion/core";
import { ThemeProvider } from "emotion-theming";
import { render } from "react-dom";
import { ApolloClient, ApolloProvider, InMemoryCache, useReactiveVar, makeVar } from "@apollo/client";
import "@apollo/space-kit/reset.css";
import { colors } from "@apollo/space-kit/colors";

import { currentScreen, Screens } from './Layouts/Navigation';
import { Queries } from './Queries/Queries';
import { Mutations } from './Mutations/Mutations';
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

export const themes: Record<ColorTheme, Record<string, string>> = {
  [ColorTheme.Light]: {
    primary: colors.indigo.darkest
  },
  [ColorTheme.Dark]: {
    primary: colors.black.base
  },
};

const screens = {
  [Screens.Explorer]: Explorer,
  [Screens.Queries]: Queries,
  [Screens.Mutations]: Mutations,
  [Screens.Cache]: () => <div>Cache</div>
};

const App = () => {
  const theme = useReactiveVar<ColorTheme>(colorTheme);
  const selected = useReactiveVar<Screens>(currentScreen);
  const Screen = screens[selected];

  return (
    <ThemeProvider theme={themes[theme]}>
      <Screen
        navigationProps={{ 
          queriesCount: 0,
          mutationsCount: 100000,
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
