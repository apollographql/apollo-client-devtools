import React from "react";
import { act, screen } from "@testing-library/react";
import { matchers } from "@emotion/jest";
import { colors } from "@apollo/space-kit/colors";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { Navigation } from "../Navigation";

expect.extend(matchers);

describe("<Navigation />", () => {
  let props;

  beforeEach(() => {
    props = {
      queriesCount: 0,
      mutationsCount: 0,
    };
  });

  it("renders the navigation items", () => {
    renderWithApolloClient(<Navigation {...props} />);

    expect(screen.getByText("Explorer")).toBeInTheDocument();
    expect(screen.getByText(`Queries (${props.queriesCount})`)).toBeInTheDocument();
    expect(screen.getByText(`Mutations (${props.queriesCount})`)).toBeInTheDocument();
    expect(screen.getByText("Cache")).toBeInTheDocument();
  });

  it("can select a navigation item", async () => {
    const { container, user } = renderWithApolloClient(<Navigation {...props} />);
    const buttons = container.querySelectorAll("button");
    const lastButton = buttons[buttons.length - 1];
    expect(lastButton).not.toHaveStyleRule("color", colors.silver.lighter);
    await act(() => user.click(lastButton));
    expect(lastButton).toHaveStyleRule("color", colors.silver.lighter);
  });
});
