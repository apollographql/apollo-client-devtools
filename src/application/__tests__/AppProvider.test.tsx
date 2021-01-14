import React from 'react';
import { render, waitFor } from '@testing-library/react';
import matchMediaMock from '../utilities/testing/matchMedia';
import { Mode, colorTheme } from '../theme';
import { AppProvider, getQueryData, getMutationData } from '../index';

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

  describe('getQueryData', () => {
    let queryData;

    beforeEach(() => {
      queryData = {
        document: {
          definitions: [{ 
            kind: 'OperationDefinition', 
            name: {
              value: 'GetColorByHex'
            } 
          }]
        },
        source: {
          body: 'query-string'
        },
        variables: {
          color: '#ee82ee'
        },
        cachedData: {
          name: 'Violet'
        },
      };
    });

    test('returns expected query data', () => {
      const data = getQueryData(queryData, 0);
      expect(data).toEqual({
        id: 0,
        __typename: 'WatchedQuery',
        name: 'GetColorByHex',
        queryString: 'query-string',
        variables: {
          color: '#ee82ee'
        },
        cachedData: {
          name: 'Violet'
        },
      });
    });

    test('ignores IntrospectionQuery', () => {
      queryData.document = {
        definitions: [{ 
          kind: 'OperationDefinition', 
          name: {
            value: 'IntrospectionQuery'
          } 
        }]
      };

      const data = getQueryData(queryData, 0);
      expect(data).toBeUndefined();
    });
  });
  describe('getMutationData', () => {
    let mutationData;
    
    beforeEach(() => {
      mutationData = {
        document: {
          definitions: [{ 
            kind: 'OperationDefinition', 
            name: {
              value: 'SaveColor'
            } 
          }],
        },
        source: {
          body: 'mutation-string'
        },
        variables: {
          color: '#ee82ee'
        },
      };
    });

    test('returns expected mutation data', () => {
      const data = getMutationData(mutationData, 0);
      expect(data).toEqual({
        id: 0,
        __typename: 'Mutation',
        name: 'SaveColor',
        mutationString: 'mutation-string',
        variables: {
          color: '#ee82ee'
        },
      });
    });
  });
});