import React from 'react';
import { within, waitForElementToBeRemoved } from '@testing-library/react';
import user from '@testing-library/user-event';
import { renderWithApolloClient } from '../../renderWithApolloClient';
import { Explorer } from '../Explorer';
import { listenForResponse } from '../graphiQLRelay';

import { graphql } from 'graphql';
import { getIntrospectionQuery } from "graphql/utilities";
import { schemaWithMocks } from '../../fakeGraphQL';

// Required to prevent an error in CodeMirror
document.createRange = () => {
  const range = new Range();

  range.getBoundingClientRect = jest.fn();

  range.getClientRects = () => {
    return {
      item: () => null,
      length: 0,
      [Symbol.iterator]: jest.fn()
    };
  };

  return range;
}

jest.mock('../graphiQLRelay', () => ({
  sendGraphiQLRequest: jest.fn(), 
  receiveGraphiQLResponses: jest.fn(), 
  listenForResponse: jest.fn(),
}));

describe('<Explorer />', () => {
  test('it renders a toolbar', () => {
    const { getByRole } = renderWithApolloClient(<Explorer />);
    const toolbar = getByRole('toolbar');
    const { getByTitle, getByLabelText } = within(toolbar);
  
    expect(toolbar).toBeInTheDocument();
    expect(getByTitle('Prettify')).toBeInTheDocument();
    expect(getByTitle('Toggle Explorer')).toBeInTheDocument();
    expect(getByLabelText('Load from cache')).toBeInTheDocument();
  });

  test('it can toggle the GraphiQLExplorer component', () => {
    const { getAllByText } = renderWithApolloClient(<Explorer />);

    // Retrieves both GraphiQL Explorer and the toolbar's Explorer button
    const [explorer, button] = getAllByText('Explorer');
    expect(explorer.closest('.docExplorerWrap')).not.toBeVisible();
    user.click(button);
    expect(explorer.closest('.docExplorerWrap')).toBeVisible();
  });

  test('it retrieves a schema from an IntrospectionQuery', async () => {
    (listenForResponse as any).mockImplementation(((_, cb) => {
      graphql(schemaWithMocks, getIntrospectionQuery()).then((result) => cb(result));
    }), );

    const { getByText } = renderWithApolloClient(<Explorer />);
    const NoSchemaError = getByText('No Schema Available');
    expect(NoSchemaError).toBeInTheDocument();

    waitForElementToBeRemoved(NoSchemaError);
  });
});


