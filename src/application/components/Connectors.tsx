import { useMemo, useState } from "react";
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
  const payloadsByOperationName = useMemo(() => {
    return payloads.reduce((memo, payload) => {
      const operationName = payload.operationName ?? "(anonymous)";

      if (!memo.has(operationName)) {
        memo.set(operationName, []);
      }

      memo.get(operationName)!.push(payload);

      return memo;
    }, new Map<string, ConnectorsDebuggingResultPayload[]>());
  }, [payloads]);

  const [selectedOperationName, setSelectedOperationName] = useState(
    () => payloadsByOperationName.keys().next().value as string | undefined
  );

  const filteredOperations = useMemo(() => {
    const operationNames = Array.from(payloadsByOperationName.keys());

    if (!searchTerm) {
      return operationNames;
    }

    const regex = new RegExp(searchTerm, "i");

    return operationNames.filter((operationName) => regex.test(operationName));
  }, [searchTerm, payloadsByOperationName]);

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
          {filteredOperations.map((operationName) => {
            return (
              <ListItem
                key={operationName}
                selected={selectedOperationName === operationName}
                onClick={() => setSelectedOperationName(operationName)}
                className="font-code"
              >
                {searchTerm ? (
                  <HighlightMatch
                    searchTerm={searchTerm}
                    value={operationName}
                  />
                ) : (
                  operationName
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
        <div>
          {selectedOperationName &&
            payloadsByOperationName
              .get(selectedOperationName)!
              .map((payload, idx) => {
                return <pre key={idx}>{JSON.stringify(payload, null, 2)}</pre>;
              })}
        </div>
      </SidebarLayout.Main>
    </SidebarLayout>
  );
}
