import { useParams } from "react-router-dom";
import { useRequest } from "../../$operationId";
import { useMemo } from "react";
import { Tabs } from "../../../../components/Tabs";
import { JSONTreeViewer } from "../../../../components/JSONTreeViewer";
import IconStatusDot from "@apollo/icons/default/IconStatusDot.svg";

export function Route() {
  const params = useParams();
  const request = useRequest();

  const data = useMemo(
    () =>
      request.debuggingResult.data.find(
        ({ id }) => String(id) === params.requestId
      )!,
    [request, params.requestId]
  );

  const response = data.response;
  const selectionErrorCount = response?.body.selection?.errors.length ?? 0;

  return (
    <Tabs>
      <Tabs.List>
        <Tabs.Trigger value="request">Request overview</Tabs.Trigger>
        <Tabs.Trigger value="response">Response overview</Tabs.Trigger>
        {response?.body && (
          <Tabs.Trigger value="responseBody">Response body</Tabs.Trigger>
        )}
        <Tabs.Trigger value="mapping" className="flex items-center gap-2">
          Mapping
          {selectionErrorCount > 0 && (
            <IconStatusDot className="size-4 text-icon-error dark:text-icon-error-dark" />
          )}
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="request" className="py-4">
        <div>URL: {data.request?.url}</div>
      </Tabs.Content>
      <Tabs.Content value="response" className="py-4">
        <div>Status code: {data.response?.status}</div>
      </Tabs.Content>
      {response?.body && (
        <Tabs.Content value="responseBody" className="py-4">
          {response.body.kind === "json" ? (
            <JSONTreeViewer
              hideRoot={!Array.isArray(response.body.content)}
              className="[&>li]:!pt-0"
              data={response.body.content}
            />
          ) : (
            String(response.body.content)
          )}
        </Tabs.Content>
      )}
      <Tabs.Content value="response" className="py-4">
        <div>Mapping: </div>
      </Tabs.Content>
    </Tabs>
  );
}
