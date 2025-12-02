import { screen, within, waitFor } from "@testing-library/react";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { client } from "../../../index";
import { Mutations } from "../Mutations";
import { getRpcClient } from "../../../../extension/devtools/panelRpcClient";
import type { GetRpcClientMock } from "../../../../extension/devtools/__mocks__/panelRpcClient";
import type { MutationV3Details } from "../../../../extension/tab/v3/types";
import { gql } from "@apollo/client";
import { print } from "graphql";

jest.mock("../../../../extension/devtools/panelRpcClient.ts");

const testAdapter = (getRpcClient as GetRpcClientMock).__adapter;

beforeEach(() => {
  client.clearStore();
  testAdapter.mockClear();
});

describe("<Mutations />", () => {
  const defaultMutations: MutationV3Details[] = [
    {
      document: gql`
        mutation {
          performTest
        }
      `,
      loading: false,
      error: null,
    },
    {
      document: gql`
        mutation AddColorToFavorites {
          addColorToFavorites
        }
      `,
      loading: false,
      error: null,
    },
  ];

  function mockRpcRequests({
    mutations = defaultMutations,
  }: {
    mutations?: MutationV3Details[];
  } = {}) {
    testAdapter.handleRpcRequest("getClient", () => ({
      id: "1",
      version: "3.10.0",
      name: undefined,
      queryCount: 0,
      mutationCount: 1,
    }));

    testAdapter.handleRpcRequest("getV3Mutations", () => mutations);
  }

  test("queries render in the sidebar", async () => {
    mockRpcRequests();

    renderWithApolloClient(<Mutations clientId="1" explorerIFrame={null} />);

    const sidebar = screen.getByRole("complementary");

    await waitFor(() => {
      expect(within(sidebar).getByText("(anonymous)")).toBeInTheDocument();
    });

    expect(
      within(sidebar).getByText("AddColorToFavorites")
    ).toBeInTheDocument();
  });

  test("renders query name", async () => {
    mockRpcRequests();

    const { user } = renderWithApolloClient(
      <Mutations clientId="1" explorerIFrame={null} />
    );

    await waitFor(() => {
      expect(
        within(screen.getByTestId("main")).getByTestId("title")
      ).toHaveTextContent("(anonymous)");
    });

    const sidebar = screen.getByRole("complementary");
    await user.click(within(sidebar).getByText("AddColorToFavorites"));
    await waitFor(() => {
      expect(screen.getByTestId("main")).toHaveTextContent(
        "AddColorToFavorites"
      );
    });
  });

  test("it renders an empty state", async () => {
    mockRpcRequests({ mutations: [] });

    renderWithApolloClient(<Mutations clientId="1" explorerIFrame={null} />);

    await waitFor(() => {
      expect(
        within(screen.getByTestId("main")).getByRole("heading")
      ).toHaveTextContent("👋 Welcome to Apollo Client Devtools");
    });
  });

  test("renders the mutation string", async () => {
    mockRpcRequests();

    renderWithApolloClient(<Mutations clientId="1" explorerIFrame={null} />);

    await waitFor(() => {
      expect(screen.getByTestId("query")).toHaveTextContent(/performTest/);
    });
  });

  test("can copy the mutation string", async () => {
    window.prompt = jest.fn();
    mockRpcRequests();

    const { user } = renderWithApolloClient(
      <Mutations clientId="1" explorerIFrame={null} />
    );

    const query = await screen.findByTestId("query");
    await user.click(within(query).getByLabelText("Copy"));
    expect(window.prompt).toHaveBeenCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      print(defaultMutations[0].document)
    );
  });

  test("renders the mutation variables", async () => {
    mockRpcRequests({
      mutations: [
        {
          document: gql`
            mutation ChangeName($name: String!) {
              changeName(name: $name) {
                name
              }
            }
          `,
          variables: { name: "Bob Vance (Vance Refridgeration)" },
          loading: false,
          error: null,
        },
      ],
    });

    renderWithApolloClient(<Mutations clientId="1" explorerIFrame={null} />);

    await waitFor(() => {
      expect(screen.getByText("Variables")).toBeInTheDocument();
    });

    expect(
      screen.getByText((content) =>
        content.includes("Bob Vance (Vance Refridgeration)")
      )
    ).toBeInTheDocument();
  });

  test("can copy the mutation variables", async () => {
    window.prompt = jest.fn();
    mockRpcRequests({
      mutations: [
        {
          document: gql`
            mutation ChangeName($name: String!) {
              changeName(name: $name) {
                name
              }
            }
          `,
          variables: { name: "Bob Vance (Vance Refridgeration)" },
          loading: false,
          error: null,
        },
      ],
    });

    const { user } = renderWithApolloClient(
      <Mutations clientId="1" explorerIFrame={null} />
    );

    await waitFor(() => {
      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    const copyButton = within(screen.getByRole("tablist")).getByRole("button");
    await user.click(copyButton);
    expect(window.prompt).toHaveBeenCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      JSON.stringify({ name: "Bob Vance (Vance Refridgeration)" })
    );
  });
});
