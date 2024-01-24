import React from "react";
import { screen } from "@testing-library/react";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { FullWidthLayout } from "../FullWidthLayout";

describe("<FullWidthLayout />", () => {
  it("renders", () => {
    renderWithApolloClient(
      <FullWidthLayout>
        <FullWidthLayout.Header>
          This is the header section
        </FullWidthLayout.Header>
        <FullWidthLayout.Main>This is the main section</FullWidthLayout.Main>
      </FullWidthLayout>
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("This is the header section")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText("This is the main section")).toBeInTheDocument();
  });
});
