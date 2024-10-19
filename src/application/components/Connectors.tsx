import { useState } from "react";
import type { ConnectorsDebuggingResultPayload } from "../../types";
import { SidebarLayout } from "./Layouts/SidebarLayout";
import { List } from "./List";
import { ListItem } from "./ListItem";
import { SearchField } from "./SearchField";
import HighlightMatch from "./HighlightMatch";

interface ConnectorsProps {
  payloads: ConnectorsDebuggingResultPayload[];
}

export function Connectors({ payloads }: ConnectorsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayload, setSelectedPayload] = useState(payloads[0]);

  if (!selectedPayload && payloads.length > 0) {
    setSelectedPayload(payloads[0]);
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
          {payloads.map((payload, idx) => {
            return (
              <ListItem
                key={idx}
                selected={selectedPayload === payload}
                onClick={() => setSelectedPayload(payload)}
                className="font-code"
              >
                {searchTerm ? (
                  <HighlightMatch
                    searchTerm={searchTerm}
                    value={payload.operationName ?? "(anonymous)"}
                  />
                ) : (
                  payload.operationName ?? "(anonymous)"
                )}
              </ListItem>
            );
          })}
        </List>
      </SidebarLayout.Sidebar>
      <SidebarLayout.Main className="!overflow-auto flex flex-col p-4">
        <h1 className="font-medium text-heading dark:text-heading-dark text-xl">
          Connectors
        </h1>
        {selectedPayload && (
          <div>
            <pre>{JSON.stringify(selectedPayload, null, 2)}</pre>
          </div>
        )}
      </SidebarLayout.Main>
    </SidebarLayout>
  );
}
