import React from 'react';
import { render } from '@testing-library/react';
import { ApolloProvider } from "@apollo/client";
import { client } from '../../index';

export const renderWithApolloClient = (
  ui, 
  { providerProps, ...renderOptions } = { providerProps: {} }
) => {
  return render(
    <ApolloProvider client={client} {...providerProps}>
      {ui}
    </ApolloProvider>,
    renderOptions
  );
}
