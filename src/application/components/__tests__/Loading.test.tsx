import * as React from 'react';
import { render } from '@testing-library/react';
import Loading from '../Loading';

test('<Loading>', () => {
  const { getByText } = render(<Loading />);
  expect(getByText('Connecting to Apollo Client...')).toBeInTheDocument();
});