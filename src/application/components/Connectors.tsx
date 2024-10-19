import { useState } from "react";
import IconInfo from "@apollo/icons/default/IconInfo.svg";
import type {
  ConnectorsDebuggingData,
  ConnectorsDebuggingResultPayload,
} from "../../types";
import { SidebarLayout } from "./Layouts/SidebarLayout";
import { List } from "./List";
import { ListItem } from "./ListItem";
import { SearchField } from "./SearchField";
import HighlightMatch from "./HighlightMatch";
import { Table } from "./Table";
import { Thead } from "./Thead";
import { Tooltip } from "./Tooltip";
import { Tbody } from "./Tbody";
import { Tr } from "./Tr";
import { Th } from "./Th";
import { Td } from "./Td";
import { CodeBlock } from "./CodeBlock";
import { Divider } from "./Divider";
import { Panel, PanelResizeHandle } from "react-resizable-panels";
import { JSONTreeViewer } from "./JSONTreeViewer";
import { isEmpty } from "../utilities/isEmpty";
import { HTTPStatusBadge } from "./HTTPStatusBadge";

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
      <SidebarLayout.Main className="!overflow-auto flex flex-col p-4 gap-4">
        <h1 className="font-medium text-heading dark:text-heading-dark text-xl">
          All requests
        </h1>
        {selectedPayload && (
          <ConnectorsData data={selectedPayload.debuggingResult.data} />
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

function ConnectorsData({ data }: { data: ConnectorsDebuggingData[] }) {
  return (
    <Table interactive variant="striped">
      <Thead>
        <Tr>
          <Th>ID</Th>
          <Th>Path</Th>
          <Th>Status</Th>
          <Th>Method</Th>
          <Th>
            <div className="flex gap-2 items-center">
              Errors{" "}
              <Tooltip content="Total mapping errors">
                <span>
                  <IconInfo className="size-3" />
                </span>
              </Tooltip>
            </div>
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map(({ request, response }, idx) => {
          const url = new URL(request?.url ?? "");

          return (
            <Tr key={idx}>
              <Td>{idx + 1}</Td>
              <Td>{url.pathname + url.search}</Td>
              <Td>
                <HTTPStatusBadge status={response?.status} />
              </Td>
              <Td>{request?.method}</Td>
              <Td>{response?.body?.selection?.errors?.length ?? 0}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
