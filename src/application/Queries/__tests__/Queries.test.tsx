import React from 'react';
import { within, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { renderWithApolloClient } from '../../utilities/testing/renderWithApolloClient';
import { client, GET_QUERIES } from '../../index';
import { Queries } from '../Queries';

jest.mock('../QueryViewer', () => ({
  QueryViewer: () => null, 
}));

describe('<Queries />', () => {
  const queries = [
    {
      id: 0,
      __typename: 'WatchedQuery',
      name: null,
    },
    {
      id: 1,
      __typename: 'WatchedQuery',
      name: 'GetColors',
    }
  ];

  const navigationProps = {
    queriesCount: 2,
    mutationsCount: 0,
  };

  test('queries render in the sidebar', async () => {
    client.writeQuery({
      query: GET_QUERIES,
      data: {
        watchedQueries: {
          queries,
          count: queries.length,
        },
      },
    });

    const { getByTestId } = renderWithApolloClient(
      <Queries navigationProps={navigationProps} />
    );

    const sidebar = getByTestId('sidebar');
    await waitFor(() => {
      expect(within(sidebar).getByText(`Active Queries (${navigationProps.queriesCount})`)).toBeInTheDocument();
      expect(within(sidebar).getByText('Unnamed')).toBeInTheDocument();
      expect(within(sidebar).getByText('GetColors')).toBeInTheDocument();
    });
  });

  test('renders query name', async () => {
    client.writeQuery({
      query: GET_QUERIES,
      data: {
        watchedQueries: {
          queries,
          count: queries.length,
        },
      },
    });

    const { getByTestId } = renderWithApolloClient(
      <Queries navigationProps={navigationProps} />
    );

    const header = getByTestId('header');
    expect(within(header).getByText('Unnamed')).toBeInTheDocument();

    const sidebar = getByTestId('sidebar');
    user.click(within(sidebar).getByText('GetColors'));
    await waitFor(() => {
      expect(within(header).getByText('GetColors')).toBeInTheDocument();
    });
  });
});