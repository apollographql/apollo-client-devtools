import React from "react";
import { screen, within, waitFor, fireEvent } from "@testing-library/react";

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
      const header = screen.getByTestId("header");
      await waitFor(() => {
        expect(header.firstChild).not.toBeInTheDocument();
      });
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
    const selectedSidebarStyles = "background-color: #1B2240";
    const selectedMainStyles = "background-color: yellow";

    beforeEach(() => {
      writeData({
        queries: [],
        mutations: [],
        cache: JSON.stringify(CACHE_DATA),
      });
    });

    it("should highlight sidebar cache ID's if a match is found", async () => {
      renderWithApolloClient(<Cache navigationProps={navigationProps} />);

      const searchInput = screen.getByPlaceholderText("Search queries");
      fireEvent.change(searchInput, { target: { value: "Result 2" } });

      const sidebar = screen.getByTestId("sidebar");

      await waitFor(() => {
        expect((searchInput as any).value).toBe("Result 2");
      });
      const result1 = within(sidebar).getByText("Result:1");
      expect(result1.parentNode).not.toHaveStyle(selectedSidebarStyles);

      const result2 = within(sidebar).getByText("Result:2");
      expect(result2.parentNode).toHaveStyle(selectedSidebarStyles);
    });

    it("should highlight object keys/values if a match is found", async () => {
      renderWithApolloClient(<Cache navigationProps={navigationProps} />);

      const searchInput = screen.getByPlaceholderText("Search queries");
      fireEvent.change(searchInput, { target: { value: "Result 2" } });

      const sidebar = screen.getByTestId("sidebar");

      const result2 = within(sidebar).getByText("Result:2");
      const result2Parent = result2.parentNode;
      fireEvent.click(result2Parent!);

      const main = screen.getByTestId("main");

      await waitFor(() => {
        expect(within(main).getByText("__typename:")).not.toHaveStyle(
          selectedMainStyles
        );
      });
      expect(within(main).getByText('"Result"')).not.toHaveStyle(
        selectedMainStyles
      );
      expect(within(main).getByText("name:")).toHaveStyle(selectedMainStyles);
      expect(within(main).getByText('"Result 2"')).toHaveStyle(
        selectedMainStyles
      );
    });
  });
});
