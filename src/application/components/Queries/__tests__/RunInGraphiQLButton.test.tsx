import React from "react";
import { render } from "@testing-library/react";
import user from "@testing-library/user-event";

import { graphiQLQuery } from "../../Explorer/Explorer";
import { currentScreen } from "../../Layouts/Navigation";
import { RunInGraphiQLButton } from "../RunInGraphiQLButton";

jest.mock("../../Explorer/Explorer", () => ({
  graphiQLQuery: jest.fn(),
}));

jest.mock("../../Layouts/Navigation", () => ({
  currentScreen: jest.fn(),
  Screens: { Explorer: "explorer" },
}));

describe("<RunInGraphiQLButton />", () => {
  const props = {
    operation: `
      query GetSavedColors {
        favoritedColors {
          ...colorFields
        }
      }

      fragment colorFields on Color {
        name
        hex
        contrast
      }
    `,
  };

  test("saves the operation and navigates to the Explorer panel", () => {
    const { getByText } = render(<RunInGraphiQLButton {...props} />);

    const button = getByText("Run in GraphiQL");
    expect(button).toBeInTheDocument();
    user.click(button);
    expect(graphiQLQuery).toHaveBeenCalledWith(props.operation);
    expect(currentScreen).toHaveBeenCalledWith("explorer");
  });
});
