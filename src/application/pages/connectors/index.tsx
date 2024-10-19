import { useReactiveVar } from "@apollo/client";
import { EmptyMessage } from "../../components/EmptyMessage";
import { SidebarLayout } from "../../components/Layouts/SidebarLayout";
import { connectorsRequestsVar } from "../../vars";
import { Navigate } from "react-router-dom";

export function Route() {
  const connectorsRequests = useReactiveVar(connectorsRequestsVar);

  if (connectorsRequests.length > 0) {
    return <Navigate to={String(connectorsRequests[0].id)} />;
  }

  return (
    <SidebarLayout.Main className="!overflow-auto flex flex-col p-4 gap-4">
      <h1 className="font-medium text-heading dark:text-heading-dark text-xl">
        All requests
      </h1>
      <EmptyMessage />
    </SidebarLayout.Main>
  );
}
