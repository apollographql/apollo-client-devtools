import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { currentScreen } from "../../Layouts/Navigation";
import { RunInExplorerButton } from "../RunInExplorerButton";
import { type Explorer } from "../../Explorer/Explorer";

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
    explorerRef: {
      current: {
        postMessage: jest.fn(),
      } satisfies Explorer.Ref,
    },
  };

  afterEach(() => {
    props.explorerRef.current!.postMessage.mockReset();
  });

  it("should navigate to the Explorer panel", async () => {
    const user = userEvent.setup();
    render(<RunInExplorerButton {...props} />);
    const button = screen.getByText("Run in Explorer");
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(currentScreen).toHaveBeenCalledWith("explorer");
    expect(props.explorerRef.current.postMessage).toHaveBeenCalledWith({
      name: "SetOperation",
      operation: props.operation,
      variables: JSON.stringify(props.variables),
    });
  });
});
