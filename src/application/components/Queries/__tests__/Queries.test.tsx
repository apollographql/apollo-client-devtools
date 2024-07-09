import React from "react";
import { screen, within, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { client } from "../../../index";
import { Queries, GET_QUERIES } from "../Queries";
import type { GetQueries } from "../../../types/gql";
import { NetworkStatus } from "@apollo/client";

describe("<Queries />", () => {
  const queries: GetQueries["client"]["queries"]["items"] = [
    {
      __typename: "WatchedQuery",
      id: "1",
      name: null,
      queryString: "query { hello }",
      variables: null,
      cachedData: null,
      options: { fetchPolicy: "cache-first" },
      pollInterval: null,
      error: null,
      networkStatus: NetworkStatus.ready,
    },
    {
      __typename: "WatchedQuery",
      id: "2",
      name: "GetColors",
      queryString: "query GetColors { colors }",
      variables: null,
      cachedData: null,
      options: { fetchPolicy: "cache-first" },
      pollInterval: null,
      error: null,
      networkStatus: NetworkStatus.ready,
    },
  ];

  beforeEach(() => {
    client.clearStore();
  });

  test("queries render in the sidebar", async () => {
    client.writeQuery({
      query: GET_QUERIES,
      data: {
        client: {
          __typename: "Client",
          id: "1",
          queries: {
            __typename: "ClientQueries",
            total: queries.length,
            items: queries,
          },
        },
      },
    });

    renderWithApolloClient(<Queries clientId="1" explorerIFrame={null} />);

    const sidebar = screen.getByRole("complementary");
    expect(within(sidebar).getByText("(anonymous)")).toBeInTheDocument();
    expect(within(sidebar).getByText("GetColors")).toBeInTheDocument();
  });

  test("renders query name", async () => {
    const user = userEvent.setup();

    client.writeQuery({
      query: GET_QUERIES,
      data: {
        client: {
          __typename: "Client",
          id: "1",
          queries: {
            __typename: "ClientQueries",
            total: queries.length,
            items: queries,
          },
        },
      },
    });

    renderWithApolloClient(<Queries clientId="1" explorerIFrame={null} />);

    const main = screen.getByTestId("main");
    expect(within(main).getByTestId("title")).toHaveTextContent("(anonymous)");

    const sidebar = screen.getByRole("complementary");
    await act(() => user.click(within(sidebar).getByText("GetColors")));
    await waitFor(() => {
      expect(within(main).getByTestId("title")).toHaveTextContent("GetColors");
    });
  });

  test("it renders an empty state", () => {
    renderWithApolloClient(<Queries clientId="1" explorerIFrame={null} />);

    expect(
      within(screen.getByTestId("main")).getByRole("heading")
    ).toHaveTextContent("👋 Welcome to Apollo Client Devtools");
  });

  test("renders the query string", () => {
    client.writeQuery({
      query: GET_QUERIES,
      data: {
        client: {
          __typename: "Client",
          id: "1",
          queries: {
            __typename: "ClientQueries",
            total: queries.length,
            items: queries,
          },
        },
      },
    });

    renderWithApolloClient(<Queries clientId="1" explorerIFrame={null} />);

    expect(screen.getByTestId("query")).toHaveTextContent(
      queries[0].queryString
    );
  });

  test("can copy the query string", async () => {
    window.prompt = jest.fn();
    client.writeQuery({
      query: GET_QUERIES,
      data: {
        client: {
          __typename: "Client",
          id: "1",
          queries: {
            __typename: "ClientQueries",
            total: queries.length,
            items: queries,
          },
        },
      },
    });

    const { user } = renderWithApolloClient(
      <Queries clientId="1" explorerIFrame={null} />
    );

    await user.click(within(screen.getByTestId("query")).getByText("Copy"));
    expect(window.prompt).toBeCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      queries[0].queryString
    );
  });

  test("renders the query data", async () => {
    client.writeQuery({
      query: GET_QUERIES,
      data: {
        client: {
          __typename: "Client",
          id: "1",
          queries: {
            __typename: "ClientQueries",
            total: 1,
            items: [
              {
                __typename: "WatchedQuery",
                id: "1",
                queryString:
                  "query GetColor($hex: String!) { color(hex: $hex) { name }}",
                name: "GetColor",
                variables: { hex: "#000" },
                cachedData: { color: { name: "black" } },
                options: { fetchPolicy: "network-only" },
                pollInterval: null,
                error: null,
                networkStatus: NetworkStatus.ready,
              },
            ],
          },
        },
      },
    });

    const { user } = renderWithApolloClient(
      <Queries clientId="1" explorerIFrame={null} />
    );

    expect(screen.getByText("Variables")).toBeInTheDocument();
    const variablesPanel = within(screen.getByTestId("main")).getByRole(
      "tabpanel"
    );
    expect(
      within(variablesPanel).getByText((content) => content.includes("#000"))
    ).toBeInTheDocument();

    const cachedDataTab = screen.getByText("Cached Data");
    expect(cachedDataTab).toBeInTheDocument();
    // TODO: Determine why this needs to be wrapped in act since user.click
    // should already be wrapped in act
    await act(() => user.click(cachedDataTab));
    const cachedDataPanel = screen.getByRole("tabpanel");
    expect(
      within(cachedDataPanel).getByText((content) => content.includes("color"))
    ).toBeInTheDocument();
  });

  test("can copy the query data", async () => {
    window.prompt = jest.fn();
    const query = {
      __typename: "WatchedQuery",
      id: "1",
      queryString: "query GetColor($hex: String!) { color(hex: $hex) { name }}",
      name: "GetColor",
      variables: { hex: "#000" },
      cachedData: { color: { name: "black" } },
      options: { fetchPolicy: "network-only" },
      pollInterval: null,
      error: null,
      networkStatus: NetworkStatus.ready,
    } satisfies GetQueries["client"]["queries"]["items"][number];

    client.writeQuery({
      query: GET_QUERIES,
      data: {
        client: {
          __typename: "Client",
          id: "1",
          queries: {
            __typename: "ClientQueries",
            total: 1,
            items: [query],
          },
        },
      },
    });

    const { user } = renderWithApolloClient(
      <Queries clientId="1" explorerIFrame={null} />
    );

    const copyButton = within(screen.getByRole("tablist")).getByRole("button");
    await act(() => user.click(copyButton));

    expect(window.prompt).toBeCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      JSON.stringify(query.variables)
    );

    const cachedDataTab = screen.getByText("Cached Data");

    await act(() => user.click(cachedDataTab));
    await act(() => user.click(copyButton));
    expect(window.prompt).toBeCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      JSON.stringify(query.cachedData)
    );
  });
});
