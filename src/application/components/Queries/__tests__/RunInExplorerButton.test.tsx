import React, { useState } from "react";
import { render } from "@testing-library/react";
import user from "@testing-library/user-event";

import { currentScreen } from "../../Layouts/Navigation";
import { RunInExplorerButton } from '../RunInExplorerButton'

jest.mock("../../Explorer/Explorer", () => ({
  graphiQLOperation: jest.fn(),
}));

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

  it("should navigate to the Explorer panel", () => {
    const { getByText } = render(<RunInExplorerButton {...props}/>);
    const button = getByText("Run in Explorer");
    expect(button).toBeInTheDocument();
    user.click(button);
    expect(currentScreen).toHaveBeenCalledWith("explorer");
  });
});
