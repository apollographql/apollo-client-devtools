import React from "react";
import { within, waitFor, fireEvent } from "@testing-library/react";

import { Cache } from "../Cache";
import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { writeData } from "../../../index";

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

describe("Cache component tests", () => {
  describe("No cache data", () => {
    it("should show no cache data message in sidebar", () => {
      const { getByTestId } = renderWithApolloClient(
        <Cache navigationProps={{}} />
      );
      const sidebar = getByTestId("sidebar");
      return waitFor(() => {
        expect(within(sidebar).getByText("No cache data")).toBeInTheDocument();
      });
    });

    it("should leave the header blank instead of trying to show a cache ID", () => {
      const { getByTestId } = renderWithApolloClient(
        <Cache navigationProps={{}} />
      );
      const header = getByTestId("header");
      return waitFor(() => {
        expect(header.firstChild).not.toBeInTheDocument();
      });
    });
  });

  describe("With cache data", () => {
    beforeEach(() => {
      writeData({
        queries: [],
        mutations: [],
        cache: JSON.stringify(CACHE_DATA),
      });
    });

    it("should show list of root cache ids in the sidebar", () => {
      const { getByTestId } = renderWithApolloClient(
        <Cache navigationProps={{}} />
      );
      const sidebar = getByTestId("sidebar");
      return waitFor(() => {
        expect(within(sidebar).getByText("ROOT_QUERY")).toBeInTheDocument();
        expect(within(sidebar).getByText("Result:1")).toBeInTheDocument();
        expect(within(sidebar).getByText("Result:2")).toBeInTheDocument();
      });
    });

    it("should show sidebar selected/active cache ID in the header", () => {
      const { getByTestId } = renderWithApolloClient(
        <Cache navigationProps={{}} />
      );
      const header = getByTestId("header");
      return waitFor(() => {
        expect(within(header).getByText("ROOT_QUERY")).toBeInTheDocument();
      });
    });

    it("should show data for the sidebar selected/active cache ID in main ", () => {
      const { getByTestId } = renderWithApolloClient(
        <Cache navigationProps={{}} />
      );
      const main = getByTestId("main");
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

    it("should highlight sidebar cache ID's if a match is found", () => {
      const { getByPlaceholderText, getByTestId } = renderWithApolloClient(
        <Cache navigationProps={{}} />
      );

      const searchInput = getByPlaceholderText("Search queries");
      fireEvent.change(searchInput, { target: { value: "Result 2" } });

      const sidebar = getByTestId("sidebar");

      return waitFor(() => {
        expect((searchInput as any).value).toBe("Result 2");

        const result1 = within(sidebar).getByText("Result:1");
        expect(result1.parentNode).not.toHaveStyle(selectedSidebarStyles);

        const result2 = within(sidebar).getByText("Result:2");
        expect(result2.parentNode).toHaveStyle(selectedSidebarStyles);
      });
    });

    it("should highlight object keys/values if a match is found", () => {
      const { getByPlaceholderText, getByTestId } = renderWithApolloClient(
        <Cache navigationProps={{}} />
      );

      const searchInput = getByPlaceholderText("Search queries");
      fireEvent.change(searchInput, { target: { value: "Result 2" } });

      const sidebar = getByTestId("sidebar");

      const result2 = within(sidebar).getByText("Result:2");
      const result2Parent = result2.parentNode;
      fireEvent.click(result2Parent!);

      const main = getByTestId("main");

      return waitFor(() => {
        expect(within(main).getByText("__typename:")).not.toHaveStyle(
          selectedMainStyles
        );
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
});
