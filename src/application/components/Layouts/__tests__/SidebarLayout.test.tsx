import React from "react";
import { screen } from "@testing-library/react";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { SidebarLayout } from "../SidebarLayout";

describe("<SidebarLayout />", () => {
  const navigationProps = { queriesCount: 0, mutationsCount: 0 };

  it("renders", () => {
    const { container } = renderWithApolloClient(
      <SidebarLayout navigationProps={navigationProps}>
        <SidebarLayout.Sidebar navigationProps={navigationProps}>
          This is the sidebar section
        </SidebarLayout.Sidebar>
        <SidebarLayout.Header>This is the header section</SidebarLayout.Header>
        <SidebarLayout.Main>This is the main section</SidebarLayout.Main>
      </SidebarLayout>
    );
    // eslint-disable-next-line testing-library/no-container
    expect(container.querySelector("nav")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByText("This is the sidebar section")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("This is the header section")).toBeInTheDocument();
    expect(screen.getByTestId("main")).toBeInTheDocument();
    expect(screen.getByText("This is the main section")).toBeInTheDocument();
  });
});
