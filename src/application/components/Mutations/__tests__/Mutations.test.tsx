import React from "react";
import { act, screen, within, waitFor } from "@testing-library/react";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { client, GET_MUTATIONS } from "../../../index";
import { Mutations } from "../Mutations";
import type { GetMutations } from "../../../types/gql";

describe("<Mutations />", () => {
  const mutations: GetMutations["mutationLog"]["mutations"] = [
    {
      id: 0,
      __typename: "WatchedMutation",
      name: null,
      mutationString: "mutation { performTest }",
      variables: null,
    },
    {
      id: 1,
      __typename: "WatchedMutation",
      name: "AddColorToFavorites",
      mutationString: "mutation AddColorToFavorites { addColorToFavorites }",
      variables: null,
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
          __typename: "MutationLog",
          mutations,
          count: mutations.length,
        },
      },
    });

    renderWithApolloClient(
      <Mutations
        navigationProps={navigationProps}
        embeddedExplorerProps={{ embeddedExplorerIFrame: null }}
      />
    );

    const sidebar = screen.getByTestId("sidebar");
    await waitFor(() => {
      expect(
        within(sidebar).queryAllByText(
          `Mutations (${navigationProps.mutationsCount})`
        ).length
      ).toBe(2);
    });
    expect(within(sidebar).getByText("Unnamed")).toBeInTheDocument();
    expect(
      within(sidebar).getByText("AddColorToFavorites")
    ).toBeInTheDocument();
  });

  test("renders query name", async () => {
    client.writeQuery({
      query: GET_MUTATIONS,
      data: {
        mutationLog: {
          __typename: "MutationLog",
          mutations,
          count: mutations.length,
        },
      },
    });

    const { user } = renderWithApolloClient(
      <Mutations
        navigationProps={navigationProps}
        embeddedExplorerProps={{ embeddedExplorerIFrame: null }}
      />
    );

    const header = screen.getByTestId("header");
    expect(within(header).getByText("Unnamed")).toBeInTheDocument();

    const sidebar = screen.getByTestId("sidebar");
    await act(() =>
      user.click(within(sidebar).getByText("AddColorToFavorites"))
    );
    await waitFor(() => {
      expect(
        within(header).getByText("AddColorToFavorites")
      ).toBeInTheDocument();
    });
  });

  test("it renders an empty state", () => {
    renderWithApolloClient(
      <Mutations
        navigationProps={navigationProps}
        embeddedExplorerProps={{ embeddedExplorerIFrame: null }}
      />
    );
    expect(screen.getByTestId("main")).toBeEmptyDOMElement();
  });
});
