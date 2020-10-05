import React from "react";
import { useQuery } from "@apollo/client";
import { SidebarLayout } from "../Layouts/SidebarLayout";

export const Mutations = ({ navigationProps }) => {

  return (
    <SidebarLayout 
      navigationProps={navigationProps}
    >
      <SidebarLayout.Sidebar>Mutations</SidebarLayout.Sidebar>
      <SidebarLayout.Header>Mutations Header</SidebarLayout.Header>
      <SidebarLayout.Main>Mutation Information</SidebarLayout.Main>
    </SidebarLayout>
  );
};