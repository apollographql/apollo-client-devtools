import React from "react";
import { screen } from "@testing-library/react";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { FullWidthLayout } from "../FullWidthLayout";

describe("<FullWidthLayout />", () => {
  it("renders", () => {
    renderWithApolloClient(
      <FullWidthLayout>
        <FullWidthLayout.Main>This is the main section</FullWidthLayout.Main>
      </FullWidthLayout>
    );

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText("This is the main section")).toBeInTheDocument();
  });
});
