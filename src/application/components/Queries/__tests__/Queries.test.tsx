import React from "react";
import { screen, within, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { client, GET_QUERIES } from "../../../index";
import { Queries } from "../Queries";
import type { GetQueries } from "../../../types/gql";

describe("<Queries />", () => {
  const queries: GetQueries["watchedQueries"]["queries"] = [
    {
      id: 0,
      __typename: "WatchedQuery",
      name: null,
      queryString: "query { hello }",
      variables: null,
      cachedData: null,
    },
    {
      id: 1,
      __typename: "WatchedQuery",
      name: "GetColors",
      queryString: "query GetColors { colors }",
      variables: null,
      cachedData: null,
    },
  ];

  beforeEach(() => {
    client.clearStore();
  });

  test("queries render in the sidebar", async () => {
    client.writeQuery({
      query: GET_QUERIES,
      data: {
        watchedQueries: {
          __typename: "WatchedQueries",
          queries,
          count: queries.length,
        },
      },
    });

    renderWithApolloClient(<Queries explorerIFrame={null} />);

    const sidebar = screen.getByTestId("sidebar");
    expect(within(sidebar).getByText("Unnamed")).toBeInTheDocument();
    expect(within(sidebar).getByText("GetColors")).toBeInTheDocument();
  });

  test("renders query name", async () => {
    const user = userEvent.setup();

    client.writeQuery({
      query: GET_QUERIES,
      data: {
        watchedQueries: {
          __typename: "WatchedQueries",
          queries,
          count: queries.length,
        },
      },
    });

    renderWithApolloClient(<Queries explorerIFrame={null} />);

    const main = screen.getByTestId("main");
    expect(within(main).getByTestId("title")).toHaveTextContent("Unnamed");

    const sidebar = screen.getByTestId("sidebar");
    await act(() => user.click(within(sidebar).getByText("GetColors")));
    await waitFor(() => {
      expect(within(main).getByTestId("title")).toHaveTextContent("GetColors");
    });
  });

  test("it renders an empty state", () => {
    renderWithApolloClient(<Queries explorerIFrame={null} />);

    expect(screen.getByTestId("main")).toBeEmptyDOMElement();
  });

  test("renders the query string", () => {
    client.writeQuery({
      query: GET_QUERIES,
      data: {
        watchedQueries: {
          __typename: "WatchedQueries",
          queries,
          count: queries.length,
        },
      },
    });

    renderWithApolloClient(<Queries explorerIFrame={null} />);

    expect(screen.getByTestId("query")).toHaveTextContent(
      queries[0].queryString
    );
  });

  test("can copy the query string", async () => {
    window.prompt = jest.fn();
    client.writeQuery({
      query: GET_QUERIES,
      data: {
        watchedQueries: {
          __typename: "WatchedQueries",
          queries,
          count: queries.length,
        },
      },
    });

    const { user } = renderWithApolloClient(<Queries explorerIFrame={null} />);

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
        watchedQueries: {
          __typename: "WatchedQueries",
          queries: [
            {
              __typename: "WatchedQuery",
              id: 0,
              queryString:
                "query GetColor($hex: String!) { color(hex: $hex) { name }}",
              name: "GetColor",
              variables: { hex: "#000" },
              cachedData: { color: { name: "black" } },
            },
          ],
          count: 1,
        },
      },
    });

    const { user } = renderWithApolloClient(<Queries explorerIFrame={null} />);

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
      id: 0,
      queryString: "query GetColor($hex: String!) { color(hex: $hex) { name }}",
      name: "GetColor",
      variables: { hex: "#000" },
      cachedData: { color: { name: "black" } },
    } satisfies GetQueries["watchedQueries"]["queries"][number];

    client.writeQuery({
      query: GET_QUERIES,
      data: {
        watchedQueries: {
          __typename: "WatchedQueries",
          queries: [query],
          count: 1,
        },
      },
    });

    const { user } = renderWithApolloClient(<Queries explorerIFrame={null} />);

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
