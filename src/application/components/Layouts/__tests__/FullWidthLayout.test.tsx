import React from "react";
import { screen } from "@testing-library/react";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { FullWidthLayout } from "../FullWidthLayout";

describe("<FullWidthLayout />", () => {
  const navigationProps = { queriesCount: 0, mutationsCount: 0 };

  it("renders", () => {
    const { container } = renderWithApolloClient(
      <FullWidthLayout navigationProps={navigationProps}>
        <FullWidthLayout.Header>
          This is the header section
        </FullWidthLayout.Header>
        <FullWidthLayout.Main>This is the main section</FullWidthLayout.Main>
      </FullWidthLayout>
    );

    // eslint-disable-next-line testing-library/no-container
    expect(container.querySelector("nav")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("This is the header section")).toBeInTheDocument();
    expect(screen.getByTestId("main")).toBeInTheDocument();
    expect(screen.getByText("This is the main section")).toBeInTheDocument();
  });
});
