import { act, screen, waitFor } from "@testing-library/react";

import { renderWithApolloClient } from "../utilities/testing/renderWithApolloClient";
import { currentScreen, Screens } from "../components/Layouts/Navigation";
import { App } from "../App";
import { getRpcClient } from "../../extension/devtools/panelRpcClient";
import type { GetRpcClientMock } from "../../extension/devtools/__mocks__/panelRpcClient";
import { Suspense } from "react";

jest.mock("../../extension/devtools/panelRpcClient.ts");

jest.mock("../components/Explorer/Explorer", () => ({
  Explorer: () => <div>Build</div>,
}));

const testAdapter = (getRpcClient as GetRpcClientMock).__adapter;

beforeEach(() => {
  testAdapter.mockClear();
});

describe("<App />", () => {
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
