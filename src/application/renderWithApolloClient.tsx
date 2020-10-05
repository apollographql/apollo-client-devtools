import React from 'react';
import { render } from '@testing-library/react';
import { ApolloProvider } from "@apollo/client";
import { ThemeProvider } from "emotion-theming";
import { client, themes, ColorTheme } from './index';

export const renderWithApolloClient = (
  ui, 
  { providerProps, ...renderOptions } = { providerProps: {} }
) => {
  return render(
    <ApolloProvider client={client} {...providerProps}>
      <ThemeProvider theme={themes[ColorTheme.Light]}>
        {ui}
      </ThemeProvider>
    </ApolloProvider>,
    renderOptions
  );
}
