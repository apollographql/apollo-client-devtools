import { act, fireEvent, screen, waitFor } from "@testing-library/react";

import { renderWithApolloClient } from "../utilities/testing/renderWithApolloClient";
import { currentScreen, Screens } from "../components/Layouts/Navigation";
import { App } from "../App";
import { client } from "..";
import { getRpcClient } from "../../extension/devtools/panelRpcClient";
import { createDevtoolsMessage, MessageType } from "../../extension/messages";
import type { GetRpcClientMock } from "../../extension/devtools/__mocks__/panelRpcClient";
import { Suspense } from "react";

jest.mock("../../extension/devtools/panelRpcClient.ts");

jest.mock("../components/Explorer/Explorer", () => ({
  Explorer: () => <div>Build</div>,
}));

const testAdapter = (getRpcClient as GetRpcClientMock).__adapter;

beforeEach(async () => {
  testAdapter.mockClear();
  await client.clearStore();
});

describe("<App />", () => {
  test("reconnects after a same-document navigation", async () => {
    const getClients = jest.fn(() => [
      {
        id: "synthetic-client",
        name: "Synthetic client",
        version: "3.12.0",
        queryCount: 0,
        mutationCount: 0,
      },
    ]);
    testAdapter.handleRpcRequest("getClients", getClients);
    testAdapter.handleRpcRequest("getClient", () => null);

    let rendered: ReturnType<typeof renderWithApolloClient>;
    // The initial AppQuery is asynchronous and suspends during render.
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(() => {
      rendered = renderWithApolloClient(
        <Suspense fallback="Loading...">
          <App />
        </Suspense>
      );
    });
    const { actor } = rendered!;

    await waitFor(() => {
      expect(actor.getSnapshot().context.registeredClients).toBe(1);
    });

    fireEvent(
      window,
      new MessageEvent("message", {
        data: createDevtoolsMessage({
          type: MessageType.Actor,
          message: { type: "pageNavigated" },
        }),
      })
    );

    await waitFor(() => expect(getClients).toHaveBeenCalledTimes(2));
    await waitFor(() => {
      expect(actor.getSnapshot().context.registeredClients).toBe(1);
    });
  });

  test("renders the selected screen", async () => {
    testAdapter.handleRpcRequest("getClients", () => []);

    // Suspense boundary won't resolve without this `act` call
    // https://github.com/testing-library/react-testing-library/issues/1385
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(() => {
      return renderWithApolloClient(
        <Suspense fallback="Loading...">
          <App />
        </Suspense>
      );
    });

    await waitFor(
      () => {
        expect(screen.getByText("Queries (0)")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    await waitFor(() => {
      currentScreen(Screens.Mutations);
      expect(currentScreen()).toEqual(Screens.Mutations);
    });
    await screen.findByText("Mutations (0)");
    await waitFor(() => {
      currentScreen(Screens.Explorer);
      expect(currentScreen()).toEqual(Screens.Explorer);
    });
    await screen.findByText("Build");
  });
});
