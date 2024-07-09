import { createRpcClient, createRpcHandler } from "../../../../extension/rpc";
import {
  createTestAdapter,
  createTestAdapterBridge,
} from "../../../../testUtils/testMessageAdapter";

const mockAdapter = createTestAdapter();
const rpcHandlerAdapter = createTestAdapter();

jest.mock("../../../../extension/devtools/panelRpcClient.ts", () => ({
  getRpcClient: () => createRpcClient(mockAdapter),
}));

import React from "react";
import { screen, within, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { client } from "../../../index";
import { Queries } from "../Queries";
import { gql, NetworkStatus } from "@apollo/client";
import type { DevtoolsRPCMessage } from "../../../../extension/messages";
import { print } from "graphql";
import type { QueryInfo } from "../../../../extension/tab/helpers";

describe("<Queries />", () => {
  const defaultQueries: QueryInfo[] = [
    {
      id: "1",
      document: gql`
        query {
          hello
        }
      `,
      options: { fetchPolicy: "cache-first" },
      networkStatus: NetworkStatus.ready,
    },
    {
      id: "2",
      document: gql`
        query GetColors {
          colors
        }
      `,
      options: { fetchPolicy: "cache-first" },
      networkStatus: NetworkStatus.ready,
    },
  ];

  function setup(queries: QueryInfo[] = defaultQueries) {
    const handle = createRpcHandler<DevtoolsRPCMessage>(rpcHandlerAdapter);

    handle("getQueries", () => queries);
    handle("getClient", (id) => {
      return {
        id,
        version: "3.10.0",
        queryCount: queries.length,
        mutationCount: 0,
      };
    });
  }

  beforeEach(() => {
    client.clearStore();
    mockAdapter.mockClear();
    rpcHandlerAdapter.mockClear();

    createTestAdapterBridge(mockAdapter, rpcHandlerAdapter);
  });

  test("queries render in the sidebar", async () => {
    setup();

    renderWithApolloClient(<Queries clientId="1" explorerIFrame={null} />);

    const sidebar = screen.getByRole("complementary");

    await waitFor(() => {
      expect(within(sidebar).getByText("(anonymous)")).toBeInTheDocument();
    });

    expect(within(sidebar).getByText("GetColors")).toBeInTheDocument();
  });

  test("renders query name", async () => {
    setup();

    const user = userEvent.setup();

    renderWithApolloClient(<Queries clientId="1" explorerIFrame={null} />);

    const main = screen.getByTestId("main");

    await waitFor(() => {
      expect(within(main).getByTestId("title")).toHaveTextContent(
        "(anonymous)"
      );
    });

    const sidebar = screen.getByRole("complementary");
    await act(() => user.click(within(sidebar).getByText("GetColors")));
    await waitFor(() => {
      expect(within(main).getByTestId("title")).toHaveTextContent("GetColors");
    });
  });

  test("it renders an empty state", async () => {
    setup();
    renderWithApolloClient(<Queries clientId="1" explorerIFrame={null} />);

    await waitFor(() => {
      expect(
        within(screen.getByTestId("main")).getByRole("heading")
      ).toHaveTextContent("👋 Welcome to Apollo Client Devtools");
    });
  });

  test("renders the query string", async () => {
    setup();

    renderWithApolloClient(<Queries clientId="1" explorerIFrame={null} />);

    await waitFor(() => {
      expect(
        screen.getByTestId("query").querySelector("pre")
      ).toHaveTextContent(print(defaultQueries[0].document));
    });
  });

  test("can copy the query string", async () => {
    window.prompt = jest.fn();
    setup();

    const { user } = renderWithApolloClient(
      <Queries clientId="1" explorerIFrame={null} />
    );

    await waitFor(() => {
      expect(
        within(screen.getByTestId("main")).getByTestId("title")
      ).toHaveTextContent("(anonymous)");
    });

    await act(() =>
      user.click(within(screen.getByTestId("query")).getByText("Copy"))
    );

    expect(window.prompt).toHaveBeenCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      print(defaultQueries[0].document)
    );
  });

  test("renders the query data", async () => {
    setup([
      {
        id: "1",
        document: gql`
          query GetColor($hex: String!) {
            color(hex: $hex) {
              name
            }
          }
        `,
        variables: { hex: "#000" },
        cachedData: { color: { name: "black" } },
        options: { fetchPolicy: "network-only" },
        networkStatus: NetworkStatus.ready,
      },
    ]);

    const { user } = renderWithApolloClient(
      <Queries clientId="1" explorerIFrame={null} />
    );

    expect(screen.getByText("Variables")).toBeInTheDocument();
    const variablesPanel = within(screen.getByTestId("main")).getByRole(
      "tabpanel"
    );

    await waitFor(() => {
      expect(
        within(variablesPanel).getByText((content) => content.includes("#000"))
      ).toBeInTheDocument();
    });

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
    const query: QueryInfo = {
      id: "1",
      document: gql`
        query GetColor($hex: String!) {
          color(hex: $hex) {
            name
          }
        }
      `,
      variables: { hex: "#000" },
      cachedData: { color: { name: "black" } },
      options: { fetchPolicy: "network-only" },
      networkStatus: NetworkStatus.ready,
    };

    setup([query]);

    const { user } = renderWithApolloClient(
      <Queries clientId="1" explorerIFrame={null} />
    );

    const copyButton = within(screen.getByRole("tablist")).getByRole("button");
    const variablesPanel = within(screen.getByTestId("main")).getByRole(
      "tabpanel"
    );

    await waitFor(() => {
      expect(
        within(variablesPanel).getByText((content) => content.includes("#000"))
      ).toBeInTheDocument();
    });

    await act(() => user.click(copyButton));

    expect(window.prompt).toHaveBeenCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      JSON.stringify(query.variables)
    );

    const cachedDataTab = screen.getByText("Cached Data");

    await act(() => user.click(cachedDataTab));
    await act(() => user.click(copyButton));
    expect(window.prompt).toHaveBeenCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      JSON.stringify(query.cachedData)
    );
  });
});
