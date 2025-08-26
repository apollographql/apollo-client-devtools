import React from "react";
import { render } from "@testing-library/react";

import SaveIcon from "../SaveIcon";

describe("<SaveIcon />", () => {
  test("should render the empty-heart icon", () => {
    const { getByTestId } = render(<SaveIcon />);
    expect(getByTestId("empty-heart")).toBeInTheDocument();
  });

  test("should render the full-heart icon", () => {
    const { getByTestId } = render(<SaveIcon isSaved />);
    expect(getByTestId("full-heart")).toBeInTheDocument();
  });
});
