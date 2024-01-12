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

    renderWithApolloClient(<Mutations explorerIFrame={null} />);

    const sidebar = screen.getByTestId("sidebar");

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
      <Mutations explorerIFrame={null} />
    );

    const main = screen.getByTestId("main");
    expect(within(main).getByTestId("title")).toHaveTextContent("Unnamed");

    const sidebar = screen.getByTestId("sidebar");
    await act(() =>
      user.click(within(sidebar).getByText("AddColorToFavorites"))
    );
    await waitFor(() => {
      expect(within(main).getByTestId("title")).toHaveTextContent(
        "AddColorToFavorites"
      );
    });
  });

  test("it renders an empty state", () => {
    renderWithApolloClient(<Mutations explorerIFrame={null} />);
    expect(screen.getByTestId("main")).toBeEmptyDOMElement();
  });
});
