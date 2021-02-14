import React from "react";
import { waitFor } from "@testing-library/react";

import { renderWithApolloClient } from "../utilities/testing/renderWithApolloClient";
import { currentScreen, Screens } from "../components/Layouts/Navigation";
import { App, reloadStatus } from "../App";

jest.mock("../components/Queries/Queries", () => ({
  Queries: ({ navigationProps }) => (
    <div>Queries ({navigationProps.queriesCount})</div>
  ),
}));
jest.mock("../components/Mutations/Mutations", () => ({
  Mutations: ({ navigationProps }) => (
    <div>Mutations ({navigationProps.mutationsCount})</div>
  ),
}));
jest.mock("../components/Explorer/Explorer", () => ({
  Explorer: () => <div>Build</div>,
}));

describe("<App />", () => {
  test("renders the selected screen", async () => {
    const { getByText } = renderWithApolloClient(<App />);
    expect(getByText("Queries (0)")).toBeInTheDocument();
    await waitFor(() => {
      currentScreen(Screens.Mutations);
      expect(currentScreen()).toEqual(Screens.Mutations);
    });
    await waitFor(() => expect(getByText("Mutations (0)")).toBeInTheDocument());
    await waitFor(() => {
      currentScreen(Screens.Explorer);
      expect(currentScreen()).toEqual(Screens.Explorer);
    });
    await waitFor(() => expect(getByText("Build")).toBeInTheDocument());
  });

  test("after reload, renders the Queries screen", async () => {
    currentScreen(Screens.Mutations);
    const { getByText, debug } = renderWithApolloClient(<App />);
    const element = getByText("Mutations (0)");
    expect(element).toBeInTheDocument();
    await waitFor(() => {
      reloadStatus(true);
      expect(reloadStatus()).toBeTruthy();
    });
    await waitFor(() => {
      expect(element).not.toBeInTheDocument();
    });
    await waitFor(() => {
      reloadStatus(false);
      expect(reloadStatus()).toBeFalsy();
    });
    await waitFor(() => {
      expect(getByText("Queries (0)")).toBeInTheDocument();
    });
  });
});
