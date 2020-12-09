import React from 'react';
import { render, waitFor } from '@testing-library/react';
import matchMediaMock from '../utilities/testing/matchMedia';
import { Mode } from '../theme';
import { AppProvider, colorTheme } from '../index';

const matchMedia = matchMediaMock();

jest.mock('../App', () => ({
  App: () => (<div>App</div>), 
}));

describe('<AppProvider />', () => {
  test('changes the color theme', async () => {
    const { getByText } = render(<AppProvider />);
    expect(getByText('App')).toBeInTheDocument();

    expect(colorTheme()).toEqual('light');
    await waitFor(() => {
      matchMedia.useMediaQuery(Mode.Dark);
      expect(colorTheme()).toEqual('dark')
    });
  });
});