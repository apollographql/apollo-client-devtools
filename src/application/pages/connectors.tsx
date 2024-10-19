import { useState } from "react";
import type { ConnectorsDebuggingResultPayload } from "../../types";
import { SidebarLayout } from "../components/Layouts/SidebarLayout";
import { List } from "../components/List";
import { ListItem } from "../components/ListItem";
import { SearchField } from "../components/SearchField";
import HighlightMatch from "../components/HighlightMatch";
import { CodeBlock } from "../components/CodeBlock";
import { Panel, PanelResizeHandle } from "react-resizable-panels";
import { JSONTreeViewer } from "../components/JSONTreeViewer";
import { isEmpty } from "../utilities/isEmpty";
import { ConnectorsRequestList } from "../components/ConnectorsRequestList";
import { useOutletContext } from "react-router-dom";

interface OutletContext {
  connectorsPayloads: ConnectorsDebuggingResultPayload[];
}

export function ConnectorsPage() {
  const { connectorsPayloads: payloads } = useOutletContext<OutletContext>();
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
      <SidebarLayout.Main className="!overflow-auto flex flex-col p-4 gap-4">
        <h1 className="font-medium text-heading dark:text-heading-dark text-xl">
          All requests
        </h1>
        {selectedPayload && (
          <ConnectorsRequestList
            requests={selectedPayload.debuggingResult.data}
          />
        )}
      </SidebarLayout.Main>
      {selectedPayload && (
        <>
          <PanelResizeHandle className="border-r border-primary dark:border-primary-dark" />
          <Panel
            id="details"
            defaultSize={25}
            minSize={25}
            className="h-full p-4 flex flex-col gap-2"
          >
            <CodeBlock language="graphql" code={selectedPayload.query} />
            <h2 className="text-heading dark:text-heading-dark font-medium text-lg">
              Variables
            </h2>
            <JSONTreeViewer
              hideRoot={!isEmpty(selectedPayload.variables)}
              className="[&>li]:!pt-0"
              data={selectedPayload.variables ?? {}}
            />
          </Panel>
        </>
      )}
    </SidebarLayout>
  );
}
