import { useState } from "react";
import { SidebarLayout } from "../components/Layouts/SidebarLayout";
import { List } from "../components/List";
import { ListItem } from "../components/ListItem";
import { SearchField } from "../components/SearchField";
import HighlightMatch from "../components/HighlightMatch";
import {
  useLocation,
  Link,
  resolvePath,
  Outlet,
  Navigate,
  useMatch,
} from "react-router-dom";
import { useReactiveVar } from "@apollo/client";
import { connectorsRequestsVar } from "../vars";

export function ConnectorsPage() {
  const connectorsRequests = useReactiveVar(connectorsRequestsVar);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const match = useMatch("/connectors/:id");

  if (!match && connectorsRequests.length > 0) {
    return <Navigate to={String(connectorsRequests[0].id)} />;
  }

  return (
    <SidebarLayout>
      <SidebarLayout.Sidebar className="flex flex-col h-full">
        <SearchField
          className="mb-4"
          placeholder="Search operations"
          onChange={setSearchTerm}
          value={searchTerm}
        />
        <List className="h-full">
          {connectorsRequests.map((payload, idx) => {
            return (
              <ListItem
                key={idx}
                selected={
                  resolvePath(`/connectors/${payload.id}`).pathname ===
                  location.pathname
                }
                className="font-code p-0"
              >
                <Link
                  to={String(payload.id)}
                  className="block no-underline py-2 px-4"
                >
                  {searchTerm ? (
                    <HighlightMatch
                      searchTerm={searchTerm}
                      value={payload.operationName ?? "(anonymous)"}
                    />
                  ) : (
                    payload.operationName ?? "(anonymous)"
                  )}
                </Link>
              </ListItem>
            );
          })}
        </List>
      </SidebarLayout.Sidebar>
      <Outlet />
    </SidebarLayout>
  );
}
