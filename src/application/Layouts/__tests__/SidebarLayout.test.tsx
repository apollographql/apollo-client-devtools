import React from "react";
import { renderWithApolloClient } from "../../utilities/testing/renderWithApolloClient";
import { SidebarLayout } from "../SidebarLayout";

describe("<SidebarLayout />", () => {
  const navigationProps = { queriesCount: 0, mutationsCount: 0 };

  it("renders", () => {
    const { container, getByTestId, getByText } = renderWithApolloClient(
      <SidebarLayout navigationProps={navigationProps}>
        <SidebarLayout.Sidebar navigationProps={navigationProps}>
          This is the sidebar section
        </SidebarLayout.Sidebar>
        <SidebarLayout.Header>This is the header section</SidebarLayout.Header>
        <SidebarLayout.Main>This is the main section</SidebarLayout.Main>
      </SidebarLayout>
    );

    expect(container.querySelector("nav")).toBeInTheDocument();
    expect(getByTestId("sidebar")).toBeInTheDocument();
    expect(getByText("This is the sidebar section")).toBeInTheDocument();
    expect(getByTestId("header")).toBeInTheDocument();
    expect(getByText("This is the header section")).toBeInTheDocument();
    expect(getByTestId("main")).toBeInTheDocument();
    expect(getByText("This is the main section")).toBeInTheDocument();
  });
});
