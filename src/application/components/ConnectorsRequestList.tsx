import IconInfo from "@apollo/icons/default/IconInfo.svg";
import { Table } from "./Table";
import { Th } from "./Th";
import { Thead } from "./Thead";
import { Tooltip } from "./Tooltip";
import { Tr } from "./Tr";
import { Tbody } from "./Tbody";
import type { ConnectorsDebuggingData } from "../../types";
import { Td } from "./Td";
import { HTTPStatusBadge } from "./HTTPStatusBadge";

interface ConnectorsRequestListProps {
  requests: ConnectorsDebuggingData[];
}

export function ConnectorsRequestList({
  requests,
}: ConnectorsRequestListProps) {
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
        {requests.map(({ request, response }, idx) => {
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
