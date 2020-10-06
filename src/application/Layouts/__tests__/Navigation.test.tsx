import React from 'react';
import { waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { matchers } from 'jest-emotion';
import { colors } from "@apollo/space-kit/colors";
import { renderWithApolloClient } from '../../renderWithApolloClient';
import { Navigation } from '../Navigation';

expect.extend(matchers);

describe('<Navigation />', () => {
  let props;

  beforeEach(() => {
    props = {
      queriesCount: 0,
      mutationsCount: 0,
    };
  });

  it('renders the navigation items', () => {
    const { getByText } = renderWithApolloClient(<Navigation {...props} />);
    expect(getByText('GraphiQL')).toBeInTheDocument();
    expect(getByText(`Queries (${props.queriesCount})`)).toBeInTheDocument();
    expect(getByText(`Mutations (${props.queriesCount})`)).toBeInTheDocument();
    expect(getByText('Cache')).toBeInTheDocument();
  });

  it('can select a navigation item', () => {
    const { container } = renderWithApolloClient(<Navigation {...props} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons[1]).not.toHaveStyleRule('color', colors.silver.lighter);
    user.click(buttons[1]);
    expect(buttons[1]).toHaveStyleRule('color', colors.silver.lighter);
  }); 
});