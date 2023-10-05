import React from "react";
import {
  screen,
  within,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { colors } from "@apollo/space-kit/colors";

import { Cache } from "../Cache";
import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { client, writeData } from "../../../index";

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

const navigationProps = {
  queriesCount: 2,
  mutationsCount: 0,
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

describe("Cache component tests", () => {
  describe("No cache data", () => {
    it("should show no cache data message in sidebar", async () => {
      renderWithApolloClient(<Cache navigationProps={navigationProps} />);
      const sidebar = screen.getByTestId("sidebar");
      await waitFor(() => {
        expect(within(sidebar).getByText("No cache data")).toBeInTheDocument();
      });
    });

    it("should leave the header blank instead of trying to show a cache ID", async () => {
      renderWithApolloClient(<Cache navigationProps={navigationProps} />);
      const cacheId = screen.queryByTestId("cache-id");
      expect(cacheId).toBeNull();
    });
  });

  describe("With cache data", () => {
    beforeEach(() => {
      client.resetStore();

      writeData({
        queries: [],
        mutations: [],
        cache: JSON.stringify(CACHE_DATA),
      });
    });

    it("should show list of root cache ids in the sidebar", async () => {
      renderWithApolloClient(<Cache navigationProps={navigationProps} />);
      const sidebar = screen.getByTestId("sidebar");
      await waitFor(() => {
        expect(within(sidebar).getByText("ROOT_QUERY")).toBeInTheDocument();
      });
      expect(within(sidebar).getByText("Result:1")).toBeInTheDocument();
      expect(within(sidebar).getByText("Result:2")).toBeInTheDocument();
    });

    it("should show sidebar selected/active cache ID in the header", async () => {
      renderWithApolloClient(<Cache navigationProps={navigationProps} />);
      const header = screen.getByTestId("header");
      await waitFor(() => {
        expect(within(header).getByText("ROOT_QUERY")).toBeInTheDocument();
      });
    });

    it("should show data for the sidebar selected/active cache ID in main ", () => {
      renderWithApolloClient(<Cache navigationProps={navigationProps} />);
      const main = screen.getByTestId("main");
      expect(within(main).getByText("ROOT_QUERY")).toBeInTheDocument();
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
    beforeEach(() => {
      writeData({
        queries: [],
        mutations: [],
        cache: JSON.stringify(CACHE_DATA),
      });
    });

    it("filters cache ID's for matches against the keyword", async () => {
      const user = userEvent.setup();
      renderWithApolloClient(<Cache navigationProps={navigationProps} />);

      const searchInput =
        screen.getByPlaceholderText<HTMLInputElement>("Search queries");
      await act(() => user.type(searchInput, "Result"));

      const sidebar = screen.getByTestId("sidebar");

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
      const selectedMainStyles = `background: ${colors.yellow.base}`;
      const user = userEvent.setup();

      renderWithApolloClient(<Cache navigationProps={navigationProps} />);

      const searchInput = screen.getByPlaceholderText("Search queries");
      await act(() => user.type(searchInput, "Res"));

      const sidebar = screen.getByTestId("sidebar");

      const result1 = within(sidebar).getByText((_, element) => {
        return elementMatchesHighlightedNode(element, "Result:1");
      });

      const result2 = within(sidebar).getByText((_, element) => {
        return elementMatchesHighlightedNode(element, "Result:2");
      });

      expect(within(result1).getByText("Res")).toHaveStyle(selectedMainStyles);
      expect(within(result1).getByText("ult:1")).not.toHaveStyle(
        selectedMainStyles
      );
      expect(within(result2).getByText("Res")).toHaveStyle(selectedMainStyles);
      expect(within(result2).getByText("ult:2")).not.toHaveStyle(
        selectedMainStyles
      );
    });
  });
});
