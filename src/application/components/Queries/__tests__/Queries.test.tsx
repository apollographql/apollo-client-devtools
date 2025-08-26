import { screen, within, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { client } from "../../../index";
import { Queries } from "../Queries";
import { gql, NetworkStatus } from "@apollo/client-3";
import { print } from "graphql";
import type { QueryV3Details } from "../../../../extension/tab/v3/types";
import { getRpcClient } from "../../../../extension/devtools/panelRpcClient";
import type { GetRpcClientMock } from "../../../../extension/devtools/__mocks__/panelRpcClient";

jest.mock("../../../../extension/devtools/panelRpcClient");

const getRpcClientMock = getRpcClient as GetRpcClientMock;

beforeEach(() => {
  getRpcClientMock.__adapter.mockClear();
});

describe("<Queries />", () => {
  const defaultQueries: QueryV3Details[] = [
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

  function mockRpcRequests(queries: QueryV3Details[] = defaultQueries) {
    getRpcClientMock.__adapter.handleRpcRequest("getV3Queries", () => queries);
    getRpcClientMock.__adapter.handleRpcRequest("getClient", (id) => ({
      id,
      name: undefined,
      version: "3.10.0",
      queryCount: queries.length,
      mutationCount: 0,
    }));
  }

  beforeEach(() => {
    client.clearStore();
  });

  test("queries render in the sidebar", async () => {
    mockRpcRequests();

    renderWithApolloClient(<Queries clientId="1" explorerIFrame={null} />);

    const sidebar = screen.getByRole("complementary");

    await waitFor(() => {
      expect(within(sidebar).getByText("(anonymous)")).toBeInTheDocument();
    });

    expect(within(sidebar).getByText("GetColors")).toBeInTheDocument();
  });

  test("renders query name", async () => {
    mockRpcRequests();

    const user = userEvent.setup();

    renderWithApolloClient(<Queries clientId="1" explorerIFrame={null} />);

    await waitFor(() => {
      expect(screen.getByTestId("title")).toHaveTextContent("(anonymous)");
    });

    const sidebar = screen.getByRole("complementary");
    await act(() => user.click(within(sidebar).getByText("GetColors")));
    await waitFor(() => {
      expect(screen.getByTestId("title")).toHaveTextContent("GetColors");
    });
  });

  test("it renders an empty state", async () => {
    mockRpcRequests([]);
    renderWithApolloClient(<Queries clientId="1" explorerIFrame={null} />);

    await waitFor(() => {
      expect(
        within(screen.getByTestId("main")).getByRole("heading")
      ).toHaveTextContent("👋 Welcome to Apollo Client Devtools");
    });
  });

  test("renders the query string", async () => {
    mockRpcRequests();

    renderWithApolloClient(<Queries clientId="1" explorerIFrame={null} />);

    await waitFor(() => {
      expect(
        screen.getByTestId("query").querySelector("pre")
      ).toHaveTextContent(/hello/);
    });
  });

  test("can copy the query string", async () => {
    window.prompt = jest.fn();
    mockRpcRequests();

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
    mockRpcRequests([
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

    await waitFor(() => {
      expect(screen.getByText("Variables")).toBeInTheDocument();
    });

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
    const query: QueryV3Details = {
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

    mockRpcRequests([query]);

    const { user } = renderWithApolloClient(
      <Queries clientId="1" explorerIFrame={null} />
    );

    await waitFor(() => {
      expect(
        within(
          within(screen.getByTestId("main")).getByRole("tabpanel")
        ).getByText((content) => content.includes("#000"))
      ).toBeInTheDocument();
    });

    const copyButton = within(screen.getByRole("tablist")).getByRole("button");

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
