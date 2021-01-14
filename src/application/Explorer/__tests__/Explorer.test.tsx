import React from 'react';
import { within, waitForElementToBeRemoved, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { renderWithApolloClient } from '../../utilities/testing/renderWithApolloClient';
import { Explorer } from '../Explorer';
import { listenForResponse } from '../graphiQLRelay';

import { graphql } from 'graphql';
import { getIntrospectionQuery } from "graphql/utilities";
import { schemaWithMocks } from '../../utilities/testing/fakeGraphQL';

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
  const navigationProps = { queriesCount: 0, mutationsCount: 0 };
  test('it renders a header', () => {
    const { getByTestId } = renderWithApolloClient(<Explorer navigationProps={navigationProps} />);
    const header = getByTestId('header');
    const { getByText, getByLabelText } = within(header);
  
    expect(header).toBeInTheDocument();
    expect(getByText('Prettify')).toBeInTheDocument();
    expect(getByText('Explorer')).toBeInTheDocument();
    expect(getByLabelText('Load from cache')).toBeInTheDocument();
    expect(getByText('Docs')).toBeInTheDocument();
  });

  test('it can toggle the GraphiQLExplorer component', () => {
    const { container, getByTestId } = renderWithApolloClient(<Explorer navigationProps={navigationProps} />);
    const header = getByTestId('header');
    const { getByText } = within(header);

    const button = getByText('Explorer');
    const explorer = container.querySelector('.docExplorerWrap');
    expect(explorer).not.toBeVisible();
    user.click(button as HTMLElement);
    expect(explorer).toBeVisible();
  });

  test('it can toggle the DocExplorer component', () => {
    const { getByTestId } = renderWithApolloClient(<Explorer navigationProps={navigationProps} />);
    const header = getByTestId('header');
    const { getByText: getByTextInHeader } = within(header);
    const button = getByTextInHeader('Docs');

    expect(screen.queryByText('DocExplorer')).not.toBeInTheDocument;
    user.click(button as HTMLElement);
    expect(screen.queryByText('DocExplorer')).toBeInTheDocument;
  });

  test('it retrieves a schema from an IntrospectionQuery', async () => {
    (listenForResponse as any).mockImplementation(((_, cb) => {
      graphql(schemaWithMocks, getIntrospectionQuery()).then((result) => cb(result));
    }), );

    const { getByText } = renderWithApolloClient(<Explorer navigationProps={navigationProps} />);
    const NoSchemaError = getByText('No Schema Available');
    expect(NoSchemaError).toBeInTheDocument();

    waitForElementToBeRemoved(NoSchemaError);
  });
});


