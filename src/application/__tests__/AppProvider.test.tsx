import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import { NetworkStatus, gql } from "@apollo/client";

import matchMediaMock from "../utilities/testing/matchMedia";
import { Mode, colorTheme } from "../theme";
import { AppProvider, getQueryData, getMutationData } from "../index";
import type {
  MutationDetails,
  QueryDetails,
} from "../../extension/tab/helpers";
import { print, getIntrospectionQuery } from "graphql";

const matchMedia = matchMediaMock();

jest.mock("../App", () => ({
  App: () => <div>App</div>,
}));

describe("<AppProvider />", () => {
  test("changes the color theme", async () => {
    render(<AppProvider />);
    expect(screen.getByText("App")).toBeInTheDocument();

    expect(colorTheme()).toEqual("light");
    await waitFor(() => {
      matchMedia.useMediaQuery(Mode.Dark);
      expect(colorTheme()).toEqual("dark");
    });
  });

  describe("getQueryData", () => {
    test("returns expected query data", () => {
      const queryData: QueryDetails = {
        document: gql`
          query GetColorByHex {
            someQuery {
              id
              __typename
            }
          }
        `,
        variables: {
          color: "#ee82ee",
        },
        cachedData: {
          name: "Violet",
        },
        options: { fetchPolicy: "network-only" },
        networkStatus: NetworkStatus.ready,
      };

      const data = getQueryData(queryData, 0);

      expect(data).toEqual({
        id: 0,
        __typename: "WatchedQuery",
        name: "GetColorByHex",
        queryString:
          "query GetColorByHex {\n  someQuery {\n    id\n    __typename\n  }\n}",
        variables: {
          color: "#ee82ee",
        },
        cachedData: {
          name: "Violet",
        },
        options: {
          fetchPolicy: "network-only",
        },
        pollInterval: null,
        error: null,
        networkStatus: NetworkStatus.ready,
      });
    });

    test("ignores IntrospectionQuery", () => {
      const queryData: QueryDetails = {
        document: gql(getIntrospectionQuery()),
      };

      const data = getQueryData(queryData, 0);
      expect(data).toBeUndefined();
    });
  });

  describe("getMutationData", () => {
    test("returns expected mutation data", () => {
      const mutation = gql`
        mutation SaveColor {
          saveColor
        }
      `;

      const mutationData: MutationDetails = {
        document: mutation,
        variables: {
          color: "#ee82ee",
        },
        loading: false,
        error: null,
      };

      const data = getMutationData(mutationData, 0);

      expect(data).toEqual({
        id: 0,
        __typename: "WatchedMutation",
        name: "SaveColor",
        mutationString: print(mutation),
        variables: {
          color: "#ee82ee",
        },
        loading: false,
        error: null,
      });
    });
  });
});
