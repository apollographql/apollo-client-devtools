import {
  useLoaderData,
  useOutletContext,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { SidebarLayout } from "../../components/Layouts/SidebarLayout";
import type { ConnectorsDebuggingResultPayloadWithId } from "../../../types";
import { ConnectorsRequestList } from "../../components/ConnectorsRequestList";

export function Element() {
  const context = useOutletContext();

  return (
    <SidebarLayout.Main className="!overflow-auto flex flex-col p-4 gap-4">
      <h1 className="font-medium text-heading dark:text-heading-dark text-xl">
        All requests
      </h1>
    </SidebarLayout.Main>
  );
}
