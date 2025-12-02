import { screen, within, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Cache } from "../Cache";
import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { client } from "../../../index";
import { getRpcClient } from "../../../../extension/devtools/panelRpcClient";
import type { GetRpcClientMock } from "../../../../extension/devtools/__mocks__/panelRpcClient";
import type { JSONObject } from "../../Explorer/postMessageHelpers";
import type { ApolloClientInfo } from "../../../../types";

jest.mock("../../../../extension/devtools/panelRpcClient");

const testAdapter = (getRpcClient as GetRpcClientMock).__adapter;

const CLIENT_DATA = {
  id: "1",
  name: undefined,
  version: "3.10.0",
  queryCount: 0,
  mutationCount: 0,
};

const CACHE_DATA = {
  "Result:1": {
    id: "1",
    __typename: "Result",
    name: "Result 1",
  },
  "Result:2": {
    id: "2",
    __typename: "Result",
    name: "Result 2",
  },
  ROOT_QUERY: {
    __typename: "Query",
    search: {
      __typename: "Results",
      count: 2,
      success: true,
      error: null,
      results: [
        {
          __ref: "Result:1",
        },
        {
          __ref: "Result:2",
        },
      ],
    },
  },
};

function elementMatchesHighlightedNode(
  element: Element | null,
  textContent: string
) {
  return (
    element?.tagName.toLowerCase() === "span" &&
    element.textContent === textContent
  );
}

beforeEach(() => {
  client.clearStore();
  testAdapter.mockClear();
});

function mockRpcRequests({
  cache = CACHE_DATA,
  client = CLIENT_DATA,
}: {
  cache?: JSONObject;
  client?: ApolloClientInfo;
} = {}) {
  testAdapter.handleRpcRequest("getClient", () => client);
  testAdapter.handleRpcRequest("getCache", () => cache);
}

describe("Cache component tests", () => {
  describe("No cache data", () => {
    it("should show no cache data message in sidebar", async () => {
      mockRpcRequests({ cache: {} });

      renderWithApolloClient(<Cache clientId="1" />);
      const main = screen.getByTestId("main");
      await waitFor(() => {
        expect(within(main).getByRole("heading")).toHaveTextContent(
          "👋 Welcome to Apollo Client Devtools"
        );
      });
    });

    it("should leave the header blank instead of trying to show a cache ID", async () => {
      mockRpcRequests({ cache: {} });

      renderWithApolloClient(<Cache clientId="1" />);
      const cacheId = screen.queryByTestId("cache-id");

      await waitFor(() => {
        expect(cacheId).toBeNull();
      });
    });
  });

  describe("With cache data", () => {
    it("should show list of root cache ids in the sidebar", async () => {
      mockRpcRequests();

      renderWithApolloClient(<Cache clientId="1" />);
      const sidebar = screen.getByRole("complementary");
      await waitFor(() => {
        expect(within(sidebar).getByText("ROOT_QUERY")).toBeInTheDocument();
      });
      expect(within(sidebar).getByText("Result:1")).toBeInTheDocument();
      expect(within(sidebar).getByText("Result:2")).toBeInTheDocument();
    });

    it("should show sidebar selected/active cache ID in the header", async () => {
      mockRpcRequests();

      renderWithApolloClient(<Cache clientId="1" />);

      const main = screen.getByTestId("main");

      await waitFor(() => {
        expect(within(main).getByText("ROOT_QUERY")).toBeInTheDocument();
      });
    });

    it("should show data for the sidebar selected/active cache ID in main ", async () => {
      mockRpcRequests();

      renderWithApolloClient(<Cache clientId="1" />);

      const main = screen.getByTestId("main");

      await waitFor(() => {
        expect(within(main).getByText("ROOT_QUERY")).toBeInTheDocument();
      });
      expect(within(main).getByText("__typename:")).toBeInTheDocument();
      expect(within(main).getByText('"Query"')).toBeInTheDocument();
      expect(within(main).getByText("search:")).toBeInTheDocument();

      fireEvent.click(within(main).getByText("▶"));

      expect(within(main).getByText("count:")).toBeInTheDocument();
      expect(within(main).getByText("2")).toBeInTheDocument();
      expect(within(main).getByText("success:")).toBeInTheDocument();
      expect(within(main).getByText("true")).toBeInTheDocument();
      expect(within(main).getByText("error:")).toBeInTheDocument();
      expect(within(main).getByText("null")).toBeInTheDocument();
    });
  });

  describe("Search", () => {
    it("filters cache ID's for matches against the keyword", async () => {
      mockRpcRequests();

      const user = userEvent.setup();
      renderWithApolloClient(<Cache clientId="1" />);

      const searchInput =
        await screen.findByPlaceholderText<HTMLInputElement>("Search cache");
      await user.type(searchInput, "Result");

      const sidebar = screen.getByRole("complementary");

      await waitFor(() => {
        expect(searchInput.value).toBe("Result");
      });

      expect(
        within(sidebar).getByText((_, element) => {
          return elementMatchesHighlightedNode(element, "Result:1");
        })
      ).toBeInTheDocument();
      expect(
        within(sidebar).getByText((_, element) => {
          return elementMatchesHighlightedNode(element, "Result:2");
        })
      ).toBeInTheDocument();
      expect(within(sidebar).queryByText("ROOT_QUERY")).not.toBeInTheDocument();
    });

    it("highlights matched substring in cache ID", async () => {
      mockRpcRequests();
      const selectedClassName =
        "bg-searchHighlight dark:bg-searchHighlight-dark";
      const user = userEvent.setup();

      renderWithApolloClient(<Cache clientId="1" />);

      const searchInput = await screen.findByPlaceholderText("Search cache");
      await user.type(searchInput, "Res");

      const sidebar = screen.getByRole("complementary");

      const result1 = within(sidebar).getByText((_, element) => {
        return elementMatchesHighlightedNode(element, "Result:1");
      });

      const result2 = within(sidebar).getByText((_, element) => {
        return elementMatchesHighlightedNode(element, "Result:2");
      });

      expect(within(result1).getByText("Res")).toHaveClass(selectedClassName);
      expect(within(result1).getByText("ult:1")).not.toHaveClass(
        selectedClassName
      );
      expect(within(result2).getByText("Res")).toHaveClass(selectedClassName);
      expect(within(result2).getByText("ult:2")).not.toHaveClass(
        selectedClassName
      );
    });
  });
});
