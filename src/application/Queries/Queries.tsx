import React from "react";
import { useQuery } from "@apollo/client";
import { SidebarLayout } from "../Layouts/SidebarLayout";

export const Queries = ({ navigationProps }) => {

  return (
    <SidebarLayout 
      navigationProps={navigationProps}
    >
      <SidebarLayout.Sidebar>Queries</SidebarLayout.Sidebar>
      <SidebarLayout.Main>Query Information</SidebarLayout.Main>
    </SidebarLayout>
  );
};

