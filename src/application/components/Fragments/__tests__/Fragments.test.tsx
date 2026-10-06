import { screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { gql } from "@apollo/client";
import React from "react";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { client } from "../../../index";
import { Fragments } from "../Fragments";
import { getRpcClient } from "../../../../extension/devtools/panelRpcClient";
import type { GetRpcClientMock } from "../../../../extension/devtools/__mocks__/panelRpcClient";
import type { FragmentWatch } from "../../../../extension/tab/shared/types";

jest.mock("../../../../extension/devtools/panelRpcClient");

const getRpcClientMock = getRpcClient as GetRpcClientMock;

const fragmentWatches: FragmentWatch[] = [
  {
    name: "ColorFields",
    document: gql`
      fragment ColorFields on Color {
        name
      }
    `,
    count: 3,
    entities: [
      { id: "Color:1", variables: { size: 1 } },
      { id: "Color:2", variables: null },
    ],
  },
];

beforeEach(() => {
  getRpcClientMock.__adapter.mockClear();
  client.clearStore();

  getRpcClientMock.__adapter.handleRpcRequest(
    "getFragmentWatches",
    () => fragmentWatches
  );
  getRpcClientMock.__adapter.handleRpcRequest(
    "getFragmentWatchData",
    (_, { id }) => ({ data: { name: `name of ${id}` }, complete: true })
  );
  getRpcClientMock.__adapter.handleRpcRequest("getClient", (id) => ({
    id,
    name: undefined,
    version: "4.0.0",
    queryCount: 0,
    mutationCount: 0,
    fragmentWatchCount: 3,
  }));
});

test("lists watched fragments and shows cached data for an entity", async () => {
  const user = userEvent.setup();

  renderWithApolloClient(<Fragments clientId="1" />);

  const sidebar = await screen.findByRole("complementary");

  await waitFor(() => {
    expect(within(sidebar).getByText("ColorFields")).toBeInTheDocument();
  });

  expect(within(sidebar).getByText("3")).toBeInTheDocument();

  const main = screen.getByTestId("main");

  expect(within(main).getByText(/3 watches/)).toBeInTheDocument();
  expect(within(main).getByText("Color:2")).toBeInTheDocument();

  await user.click(within(main).getByText("Color:2"));

  await waitFor(() => {
    expect(
      within(main).getByText((content) => content.includes("name of Color:2"))
    ).toBeInTheDocument();
  });
});
