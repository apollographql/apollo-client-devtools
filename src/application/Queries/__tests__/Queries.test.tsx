import React from 'react';
import { renderWithApolloClient } from '../../utilities/testing/renderWithApolloClient';
import { Queries } from '../Queries';

jest.mock('../QueryViewer', () => ({
  QueryViewer: () => null, 
}));

describe('<Queries />', () => {
  const navigationProps = {
    queriesCount: 1,
    mutationsCount: 2,
  };

  it('renders the query string', () => {
    const { getByText } = renderWithApolloClient(
      <Queries navigationProps={navigationProps} />
    );

    expect(getByText('Unnamed')).toBeInTheDocument();
  });
});