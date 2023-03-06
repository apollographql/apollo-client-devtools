import React from "react";
import { act, screen, within } from "@testing-library/react";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { QueryViewer } from "../QueryViewer";

describe("<QueryViewer />", () => {
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
    variables: { hex: "#E4C4B1" },
    cachedData: { color: "#D4EABD", contrast: "#000000" },
  };

  test("renders the query string", () => {
    renderWithApolloClient(<QueryViewer {...props} />);

    expect(screen.getByText("Query String")).toBeInTheDocument();
    expect(screen.getByText("GetSavedColors")).toBeInTheDocument();
    expect(screen.getAllByText("colorFields").length).toEqual(2);
  });

  test("can copy the query string", async () => {
    const { user } = renderWithApolloClient(<QueryViewer {...props} />);

    const queryString = screen.getByTestId("copy-query-string");
    await user.click(queryString);
    expect(window.prompt).toBeCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      props.queryString
    );
  });

  test("renders the query data", async () => {
    const { user } = renderWithApolloClient(<QueryViewer {...props} />);

    expect(screen.getByText("Variables")).toBeInTheDocument();
    const variablesPanel = screen.getByRole("tabpanel");
    expect(
      within(variablesPanel).getByText((content) =>
        content.includes(props.variables.hex)
      )
    ).toBeInTheDocument();

    const cachedDataTab = screen.getByText("Cached Data");
    expect(cachedDataTab).toBeInTheDocument();
    // TODO: Determine why this needs to be wrapped in act since user.click 
    // should already be wrapped in act
    await act(async () => {
      await user.click(cachedDataTab);
    });
    const cachedDataPanel = screen.getByRole("tabpanel");
    expect(
      within(cachedDataPanel).getByText((content) =>
        content.includes(props.cachedData.color)
      )
    ).toBeInTheDocument();
  });

  test("can copy the query data", async () => {
    const { user } = renderWithApolloClient(<QueryViewer {...props} />);

    const copyButton = screen.getByTestId("copy-query-data");
    await act(async () => {
      await user.click(copyButton);
    });
    expect(window.prompt).toBeCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      JSON.stringify(props.variables)
    );

    const cachedDataTab = screen.getByText("Cached Data");

    await act(async () => {
      await user.click(cachedDataTab);
    });
    await act(async () => {
      await user.click(copyButton);
    });
    expect(window.prompt).toBeCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      JSON.stringify(props.cachedData)
    );
  });
});
