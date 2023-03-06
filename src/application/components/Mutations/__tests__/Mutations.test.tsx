import React from "react";
import { act, screen, within, waitFor } from "@testing-library/react";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { client, GET_MUTATIONS } from "../../../index";
import { Mutations } from "../Mutations";

jest.mock("../MutationViewer", () => ({
  MutationViewer: () => null,
}));

describe("<Mutations />", () => {
  const mutations = [
    {
      id: 0,
      __typename: "Mutation",
      name: null,
    },
    {
      id: 1,
      __typename: "Mutation",
      name: "AddColorToFavorites",
    },
  ];

  const navigationProps = {
    queriesCount: 0,
    mutationsCount: 2,
  };

  beforeEach(() => {
    client.clearStore();
  });

  test("queries render in the sidebar", async () => {
    client.writeQuery({
      query: GET_MUTATIONS,
      data: {
        mutationLog: {
          mutations,
          count: mutations.length,
        },
      },
    });

    renderWithApolloClient(
      <Mutations navigationProps={navigationProps} embeddedExplorerProps={{ embeddedExplorerIFrame: null }}/>
    );

    const sidebar = screen.getByTestId("sidebar");
    await waitFor(() => {
      expect(
        within(sidebar).queryAllByText(
          `Mutations (${navigationProps.mutationsCount})`
        ).length
      ).toBe(2);
      expect(within(sidebar).getByText("Unnamed")).toBeInTheDocument();
      expect(
        within(sidebar).getByText("AddColorToFavorites")
      ).toBeInTheDocument();
    });
  });

  test("renders query name", async () => {
    client.writeQuery({
      query: GET_MUTATIONS,
      data: {
        mutationLog: {
          mutations,
          count: mutations.length,
        },
      },
    });

    const { user } = renderWithApolloClient(
      <Mutations navigationProps={navigationProps} embeddedExplorerProps={{ embeddedExplorerIFrame: null }}/>
    );

    const header = screen.getByTestId("header");
    expect(within(header).getByText("Unnamed")).toBeInTheDocument();

    const sidebar = screen.getByTestId("sidebar");
    await act(async () => {
      await user.click(within(sidebar).getByText("AddColorToFavorites"));
    });
    await waitFor(() => {
      expect(
        within(header).getByText("AddColorToFavorites")
      ).toBeInTheDocument();
    });
  });

  test("it renders an empty state", () => {
    renderWithApolloClient(
      <Mutations navigationProps={navigationProps} embeddedExplorerProps={{ embeddedExplorerIFrame: null }}/>
    );

    expect(screen.getByTestId("header")).toBeEmptyDOMElement();
    expect(screen.getByTestId("main")).toBeEmptyDOMElement();
  });
});
