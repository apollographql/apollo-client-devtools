import { useState } from "react";
import { screen } from "@testing-library/react";
import * as ResizeObserverModule from "resize-observer-polyfill";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { SettingsModal } from "../SettingsModal";

global.ResizeObserver = ResizeObserverModule.default;

describe("<SettingsModal />", () => {
  it("can be toggled open and closed", async () => {
    const setOpenMock = jest.fn();

    const WrappedSettingsModal = () => {
      const [open, setOpen] = useState(false);

      const handleOpen = (value: boolean) => {
        setOpenMock(value);
        setOpen(value);
      };

      return (
        <>
          <button onClick={() => handleOpen(!open)}>Toggle modal</button>
          <SettingsModal onOpen={handleOpen} open={open} />
        </>
      );
    };

    const { user } = renderWithApolloClient(<WrappedSettingsModal />);

    expect(screen.queryByText("0.0.0")).toBeNull();

    await user.click(screen.getByText("Toggle modal"));
    expect(setOpenMock).toHaveBeenCalledTimes(1);

    expect(screen.getByText("0.0.0")).toBeInTheDocument();

    await user.click(screen.getByText("Toggle modal"));
  });
});
