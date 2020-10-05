import React from "react";
// import { useQuery } from "@apollo/client";
import { IconRun } from "@apollo/space-kit/icons/IconRun";
import { SidebarLayout } from "../Layouts/SidebarLayout";

export const Queries = ({ navigationProps }) => {

  return (
    <SidebarLayout 
      navigationProps={navigationProps}
    >
      <SidebarLayout.Sidebar>Queries</SidebarLayout.Sidebar>
      <SidebarLayout.Header>
        <button>
          <IconRun />
          <span>Run in GraphiQL</span>
        </button>
      </SidebarLayout.Header>
      <SidebarLayout.Main>Query Information</SidebarLayout.Main>
    </SidebarLayout>
  );
};

