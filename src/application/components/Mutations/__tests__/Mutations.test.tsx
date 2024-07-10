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
      loading: false,
      error: null,
    },
    {
      id: 1,
      __typename: "WatchedMutation",
      name: "AddColorToFavorites",
      mutationString: "mutation AddColorToFavorites { addColorToFavorites }",
      variables: null,
      loading: false,
      error: null,
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

    const sidebar = screen.getByRole("complementary");

    expect(within(sidebar).getByText("(anonymous)")).toBeInTheDocument();
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
    expect(within(main).getByTestId("title")).toHaveTextContent("(anonymous)");

    const sidebar = screen.getByRole("complementary");
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
    expect(
      within(screen.getByTestId("main")).getByRole("heading")
    ).toHaveTextContent("👋 Welcome to Apollo Client Devtools");
  });

  test("renders the mutation string", () => {
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

    expect(screen.getByTestId("query")).toHaveTextContent(
      mutations[0].mutationString
    );
  });

  test("can copy the mutation string", async () => {
    window.prompt = jest.fn();
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

    await user.click(within(screen.getByTestId("query")).getByText("Copy"));
    expect(window.prompt).toBeCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      mutations[0].mutationString
    );
  });

  test("renders the mutation variables", () => {
    client.writeQuery({
      query: GET_MUTATIONS,
      data: {
        mutationLog: {
          __typename: "MutationLog",
          mutations: [
            {
              __typename: "WatchedMutation",
              id: 0,
              name: "ChangeName",
              mutationString: `mutation ChangeName($name: String!) { changeName(name: $name) { name } }`,
              variables: { name: "Bob Vance (Vance Refridgeration)" },
              loading: false,
              error: null,
            },
          ],
          count: 1,
        },
      },
    });

    renderWithApolloClient(<Mutations explorerIFrame={null} />);

    expect(screen.getByText("Variables")).toBeInTheDocument();

    expect(
      screen.getByText((content) =>
        content.includes("Bob Vance (Vance Refridgeration)")
      )
    ).toBeInTheDocument();
  });

  test("can copy the mutation variables", async () => {
    window.prompt = jest.fn();
    client.writeQuery({
      query: GET_MUTATIONS,
      data: {
        mutationLog: {
          __typename: "MutationLog",
          mutations: [
            {
              __typename: "WatchedMutation",
              id: 0,
              name: "ChangeName",
              mutationString: `mutation ChangeName($name: String!) { changeName(name: $name) { name } }`,
              variables: { name: "Bob Vance (Vance Refridgeration)" },
              loading: false,
              error: null,
            },
          ],
          count: 1,
        },
      },
    });

    const { user } = renderWithApolloClient(
      <Mutations explorerIFrame={null} />
    );

    const copyButton = within(screen.getByRole("tablist")).getByRole("button");
    await user.click(copyButton);
    expect(window.prompt).toBeCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      JSON.stringify({ name: "Bob Vance (Vance Refridgeration)" })
    );
  });
});
