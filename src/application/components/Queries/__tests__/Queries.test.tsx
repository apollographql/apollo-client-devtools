import React from "react";
import { screen, within, waitFor } from "@testing-library/react";
import user from "@testing-library/user-event";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { client, GET_QUERIES } from "../../../index";
import { Queries } from "../Queries";
import type { GetQueries } from "../../../types/gql";

jest.mock("../QueryViewer", () => ({
  QueryViewer: () => null,
}));

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

  const navigationProps = {
    queriesCount: 2,
    mutationsCount: 0,
  };

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

    renderWithApolloClient(
      <Queries
        navigationProps={navigationProps}
        embeddedExplorerProps={{ embeddedExplorerIFrame: null }}
      />
    );

    const sidebar = screen.getByTestId("sidebar");
    await waitFor(() => {
      expect(
        within(sidebar).getByText(
          `Active Queries (${navigationProps.queriesCount})`
        )
      ).toBeInTheDocument();
    });
    expect(within(sidebar).getByText("Unnamed")).toBeInTheDocument();
    expect(within(sidebar).getByText("GetColors")).toBeInTheDocument();
  });

  test("renders query name", async () => {
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

    renderWithApolloClient(
      <Queries
        navigationProps={navigationProps}
        embeddedExplorerProps={{ embeddedExplorerIFrame: null }}
      />
    );

    const header = screen.getByTestId("header");
    expect(within(header).getByText("Unnamed")).toBeInTheDocument();

    const sidebar = screen.getByTestId("sidebar");
    await user.click(within(sidebar).getByText("GetColors"));
    await waitFor(() => {
      expect(within(header).getByText("GetColors")).toBeInTheDocument();
    });
  });

  test("it renders an empty state", () => {
    renderWithApolloClient(
      <Queries
        navigationProps={navigationProps}
        embeddedExplorerProps={{ embeddedExplorerIFrame: null }}
      />
    );

    expect(screen.getByTestId("header")).toBeEmptyDOMElement();
    expect(screen.getByTestId("main")).toBeEmptyDOMElement();
  });
});
