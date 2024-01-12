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
});
