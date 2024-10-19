import { EmptyMessage } from "../../components/EmptyMessage";
import { SidebarLayout } from "../../components/Layouts/SidebarLayout";

export function ConnectorsIndexPage() {
  return (
    <SidebarLayout.Main className="!overflow-auto flex flex-col p-4 gap-4">
      <h1 className="font-medium text-heading dark:text-heading-dark text-xl">
        All requests
      </h1>
      <EmptyMessage />
    </SidebarLayout.Main>
  );
}
