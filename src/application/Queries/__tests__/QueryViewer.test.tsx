import React from 'react';
import { within } from '@testing-library/react';
import user from '@testing-library/user-event';
import stringifyObject from "stringify-object";
import { renderWithApolloClient } from '../../renderWithApolloClient';
import { QueryViewer } from '../QueryViewer';

describe('<QueryViewer />', () => {
  beforeEach(() => {
    window.prompt = jest.fn();
  });

  const props = { 
    queryString: `
      query GetSavedColors {
        favoritedColors {
          ...colorFields
        }
      }
      fragment colorFields on Color {
        name
        hex
        contrast
      }
    `, 
    variables: { hex: '#E4C4B1' }, 
    cachedData: { color: '#D4EABD', contrast: "#000000" }, 
  };

  test('renders the query string', () => {
    const { getByText, getAllByText } = renderWithApolloClient(
      <QueryViewer {...props} />
    );

    expect(getByText('Query String')).toBeInTheDocument();
    expect(getByText('GetSavedColors')).toBeInTheDocument();
    expect(getAllByText('colorFields').length).toEqual(2);
  });

  test('can copy the query string', () => {
    const { getByTestId } = renderWithApolloClient(
      <QueryViewer {...props} />
    );

    const queryString = getByTestId('copy-query-string');
    user.click(queryString);
    expect(window.prompt).toBeCalledWith("Copy to clipboard: Ctrl+C, Enter", props.queryString);
  });

  test('renders the query data', () => {
    const { getByText, getByRole } = renderWithApolloClient(
      <QueryViewer {...props} />
    );

    expect(getByText('Variables')).toBeInTheDocument();
    const variablesPanel = getByRole('tabpanel');
    expect(within(variablesPanel).getByText(content => content.includes(props.variables.hex))).toBeInTheDocument();

    const cachedDataTab = getByText('Cached Data');
    expect(cachedDataTab).toBeInTheDocument();
    user.click(cachedDataTab);
    const cachedDataPanel = getByRole('tabpanel');
    expect(within(cachedDataPanel).getByText(content => content.includes(props.cachedData.color))).toBeInTheDocument();
  });

  test('can copy the query data', () => {
    const { getByTestId, getByText } = renderWithApolloClient(
      <QueryViewer {...props} />
    );

    const queryString = getByTestId('copy-query-data');
    user.click(queryString);
    expect(window.prompt).toBeCalledWith("Copy to clipboard: Ctrl+C, Enter", stringifyObject(props.variables));

    const cachedDataTab = getByText('Cached Data');
    user.click(cachedDataTab);
    user.click(queryString);
    expect(window.prompt).toBeCalledWith("Copy to clipboard: Ctrl+C, Enter", stringifyObject(props.cachedData));
  });
});