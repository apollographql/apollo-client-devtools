import React from "react";
import { screen } from "@testing-library/react";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { SidebarLayout } from "../SidebarLayout";

describe("<SidebarLayout />", () => {
  it("renders", () => {
    renderWithApolloClient(
      <SidebarLayout>
        <SidebarLayout.Sidebar>
          This is the sidebar section
        </SidebarLayout.Sidebar>
        <SidebarLayout.Main>This is the main section</SidebarLayout.Main>
      </SidebarLayout>
    );
    expect(screen.getByRole("complementary")).toBeInTheDocument();
    expect(screen.getByText("This is the sidebar section")).toBeInTheDocument();
    expect(screen.getByTestId("main")).toBeInTheDocument();
    expect(screen.getByText("This is the main section")).toBeInTheDocument();
  });
});
