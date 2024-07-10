import { render, waitFor, screen } from "@testing-library/react";

import matchMediaMock from "../utilities/testing/matchMedia";
import { Mode, colorTheme } from "../theme";
import { AppProvider } from "../index";

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
});
