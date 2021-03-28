import React from "react";
import { render } from "@testing-library/react";
import user from "@testing-library/user-event";

import { graphiQLOperation } from "../../Explorer/Explorer";
import { currentScreen } from "../../Layouts/Navigation";
import { RunInGraphiQLButton } from "../RunInGraphiQLButton";

jest.mock("../../Explorer/Explorer", () => ({
  graphiQLOperation: jest.fn(),
}));

jest.mock("../../Layouts/Navigation", () => ({
  currentScreen: jest.fn(),
  Screens: { Explorer: "explorer" },
}));

describe("<RunInGraphiQLButton />", () => {
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
  };

  it("should save the operation + variables and navigate to the Explorer panel", () => {
    const { getByText } = render(<RunInGraphiQLButton {...props} />);
    const button = getByText("Run in GraphiQL");
    expect(button).toBeInTheDocument();
    user.click(button);
    expect(graphiQLOperation).toHaveBeenCalledWith({
      operation: props.operation,
      variables: props.variables,
    });
    expect(currentScreen).toHaveBeenCalledWith("explorer");
  });
});
