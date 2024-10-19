import { useState } from "react";
import type { ConnectorsDebuggingResultPayloadWithId } from "../../types";
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
import {
  useOutletContext,
  matchPath,
  useLocation,
  Link,
  resolvePath,
  Outlet,
} from "react-router-dom";

interface OutletContext {
  connectorsPayloads: ConnectorsDebuggingResultPayloadWithId[];
}

export function ConnectorsPage() {
  const { connectorsPayloads: payloads } = useOutletContext<OutletContext>();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayload, setSelectedPayload] = useState(payloads[0]);

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
      <SidebarLayout.Main className="!overflow-auto flex flex-col p-4 gap-4">
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
