import { Panel, PanelResizeHandle } from "react-resizable-panels";
import { Alert } from "../../components/Alert";
import { SidebarLayout } from "../../components/Layouts/SidebarLayout";
import { connectorsRequestsVar } from "../../vars";
import type { LoaderFunctionArgs } from "react-router-dom";
import { Outlet, useLoaderData, useOutletContext } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { JSONTreeViewer } from "../../components/JSONTreeViewer";
import { isEmpty } from "../../utilities/isEmpty";
import type { ConnectorsDebuggingResultPayloadWithId } from "../../../types";

export function loader({ params }: LoaderFunctionArgs) {
  const request = connectorsRequestsVar().find(
    (request) => String(request.id) === params.operationId
  );

  return { request };
}

export function Route() {
  const { request } = useLoaderData() as ReturnType<typeof loader>;

  if (!request) {
    return (
      <SidebarLayout.Main className="!overflow-auto flex flex-col p-4 gap-4">
        <h1 className="font-medium text-heading dark:text-heading-dark text-2xl">
          All requests
        </h1>
        <Alert variant="error">Connectors request not found</Alert>
      </SidebarLayout.Main>
    );
  }

  return (
    <>
      <SidebarLayout.Main className="!overflow-auto flex flex-col p-4 gap-4">
        <h1 className="font-medium text-heading dark:text-heading-dark text-2xl">
          All requests
        </h1>
        <Outlet context={request} />
      </SidebarLayout.Main>
      <PanelResizeHandle className="border-r border-primary dark:border-primary-dark" />
      <Panel
        id="details"
        defaultSize={25}
        minSize={25}
        className="h-full p-4 flex flex-col gap-2"
      >
        <h2 className="text-heading dark:text-heading-dark font-medium text-lg">
          Query
        </h2>
        <CodeBlock language="graphql" code={request.query} />
        <h2 className="text-heading dark:text-heading-dark font-medium text-lg">
          Variables
        </h2>
        <JSONTreeViewer
          hideRoot={!isEmpty(request.variables)}
          className="[&>li]:!pt-0"
          data={request.variables ?? {}}
        />
      </Panel>
    </>
  );
}

export function useRequest() {
  return useOutletContext<ConnectorsDebuggingResultPayloadWithId>();
}