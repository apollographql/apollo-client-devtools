import IconInfo from "@apollo/icons/default/IconInfo.svg";
import { useRequest } from "../$operationId";
import { Table } from "../../../components/Table";
import { Thead } from "../../../components/Thead";
import { Tr } from "../../../components/Tr";
import { Th } from "../../../components/Th";
import { Tooltip } from "../../../components/Tooltip";
import { Td } from "../../../components/Td";
import { Tbody } from "../../../components/Tbody";
import { HTTPStatusBadge } from "../../../components/HTTPStatusBadge";
import { useNavigate } from "react-router-dom";

export function Route() {
  const request = useRequest();
  const navigate = useNavigate();

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
        {request.debuggingResult.data.map(({ id, request, response }) => {
          const url = new URL(request?.url ?? "");

          return (
            <Tr key={id} onClick={() => navigate(String(id))}>
              <Td>{id}</Td>
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
