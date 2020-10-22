import React from 'react';
import { renderWithApolloClient } from '../../utilities/testing/renderWithApolloClient';
import { FullWidthLayout } from '../FullWidthLayout';

describe('<FullWidthLayout />', () => {
  const navigationProps = { queriesCount: 0, mutationsCount: 0 };

  it('renders', () => {
    const { container, getByTestId, getByText } = renderWithApolloClient(
      <FullWidthLayout navigationProps={navigationProps}>
        <FullWidthLayout.Header>This is the header section</FullWidthLayout.Header>
        <FullWidthLayout.Main>This is the main section</FullWidthLayout.Main>
      </FullWidthLayout>
    );

    expect(container.querySelector('nav')).toBeInTheDocument();
    expect(getByTestId('header')).toBeInTheDocument();
    expect(getByText('This is the header section')).toBeInTheDocument();
    expect(getByTestId('main')).toBeInTheDocument();
    expect(getByText('This is the main section')).toBeInTheDocument();
  });
});