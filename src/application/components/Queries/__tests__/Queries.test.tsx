import React from "react";
import { within, waitFor } from "@testing-library/react";
import user from "@testing-library/user-event";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { client, currentClient, GET_QUERIES } from "../../../index";
import { Queries } from "../Queries";

jest.mock("../QueryViewer", () => ({
  QueryViewer: () => null,
}));

const clientId = "client-1";

describe("<Queries />", () => {
  const queries = [
    {
      id: 0,
      __typename: "WatchedQuery",
      clientId,
      name: null,
    },
    {
      id: 1,
      __typename: "WatchedQuery",
      clientId,
      name: "GetColors",
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
    currentClient(clientId);
    client.writeQuery({
      query: GET_QUERIES,
      data: {
        client: {
          id: clientId,
          __typename: "Client",
          watchedQueries: {
            queries,
            count: queries.length,
          },
        },
      },
      variables: {
        clientId,
      },
    });

    const { getByTestId } = renderWithApolloClient(
      <Queries navigationProps={navigationProps} embeddedExplorerProps={{ embeddedExplorerIFrame: null }}/>
    );

    const sidebar = getByTestId("sidebar");
    await waitFor(() => {
      expect(
        within(sidebar).getByText(
          `Active Queries (${navigationProps.queriesCount})`
        )
      ).toBeInTheDocument();
      expect(within(sidebar).getByText("Unnamed")).toBeInTheDocument();
      expect(within(sidebar).getByText("GetColors")).toBeInTheDocument();
    });
  });

  test("renders query name", async () => {
    currentClient(clientId);
    client.writeQuery({
      query: GET_QUERIES,
      data: {
        client: {
          id: clientId,
          __typename: "Client",
          watchedQueries: {
            queries,
            count: queries.length,
          },
        },
      },
      variables: {
        clientId,
      },
    });

    const { getByTestId } = renderWithApolloClient(
      <Queries navigationProps={navigationProps} embeddedExplorerProps={{ embeddedExplorerIFrame: null }}/>
    );

    const header = getByTestId("header");
    expect(within(header).getByText("Unnamed")).toBeInTheDocument();

    const sidebar = getByTestId("sidebar");
    user.click(within(sidebar).getByText("GetColors"));
    await waitFor(() => {
      expect(within(header).getByText("GetColors")).toBeInTheDocument();
    });
  });

  test("it renders an empty state", () => {
    const { getByTestId } = renderWithApolloClient(
      <Queries navigationProps={navigationProps} embeddedExplorerProps={{ embeddedExplorerIFrame: null }}/>
    );

    expect(getByTestId("header")).toBeEmptyDOMElement();
    expect(getByTestId("main")).toBeEmptyDOMElement();
  });
});
