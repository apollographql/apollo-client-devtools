import React from "react";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { currentScreen } from "../../Layouts/Navigation";
import { RunInExplorerButton } from '../RunInExplorerButton'

jest.mock("../../Layouts/Navigation", () => ({
  currentScreen: jest.fn(),
  Screens: { Explorer: "explorer" },
}));

describe("<RunInExplorerButton />", () => {
  const props = {
    operation: `
      query GetSavedColors($filter: String!) {
        favoritedColors(filter: $filter) {
          ...colorFields
        }
      }

      fragment colorFields on Color {
        name
        hex
        contrast
      }
    `,
    variables: {
      filter: "red",
    },
    embeddedExplorerIFrame: <iframe src="https://embed.apollographql.com" /> as unknown as HTMLIFrameElement,
  };

  it("should navigate to the Explorer panel", async () => {
    const user = userEvent.setup();
    render(<RunInExplorerButton {...props}/>);
    const button = screen.getByText("Run in Explorer");
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(currentScreen).toHaveBeenCalledWith("explorer");
  });
});
