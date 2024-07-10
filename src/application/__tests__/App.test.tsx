import { screen, waitFor } from "@testing-library/react";

import { renderWithApolloClient } from "../utilities/testing/renderWithApolloClient";
import { currentScreen, Screens } from "../components/Layouts/Navigation";
import { App } from "../App";

jest.mock("../components/Explorer/Explorer", () => ({
  Explorer: () => <div>Build</div>,
}));

describe("<App />", () => {
  test("renders the selected screen", async () => {
    renderWithApolloClient(<App />);
    expect(screen.getByText("Queries (0)")).toBeInTheDocument();
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
