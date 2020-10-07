import React from 'react';
import { render } from '@testing-library/react';
import { ApolloProvider } from "@apollo/client";
import { ThemeProvider } from "emotion-theming";
import { client } from './index';
import { themes, ColorTheme } from './theme';

export const renderWithApolloClient = (
  ui, 
  { providerProps, theme, ...renderOptions } = { providerProps: {}, theme: ColorTheme.Light }
) => {
  return render(
    <ApolloProvider client={client} {...providerProps}>
      <ThemeProvider theme={themes[theme]}>
        {ui}
      </ThemeProvider>
    </ApolloProvider>,
    renderOptions
  );
}
