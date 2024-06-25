import { useState } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { NetworkStatus, gql, useQuery } from "@apollo/client";
import { isNetworkRequestInFlight } from "@apollo/client/core/networkStatus";
import { List } from "../List";
import { ListItem } from "../ListItem";
import IconErrorSolid from "@apollo/icons/default/IconErrorSolid.svg";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "./RunInExplorerButton";
import type {
  GetWatchedQueries,
  GetWatchedQueriesVariables,
} from "../../types/gql";
import { Tabs } from "../Tabs";
import { JSONTreeViewer } from "../JSONTreeViewer";
import { QueryLayout } from "../QueryLayout";
import { CopyButton } from "../CopyButton";
import { EmptyMessage } from "../EmptyMessage";
import { isEmpty } from "../../utilities/isEmpty";
import { Spinner } from "../Spinner";

enum QueryTabs {
  Variables = "Variables",
  CachedData = "CachedData",
  Options = "Options",
}

const GET_WATCHED_QUERIES: TypedDocumentNode<
  GetWatchedQueries,
  GetWatchedQueriesVariables
> = gql`
  query GetWatchedQueries {
    watchedQueries @client {
      queries {
        id
        name
        queryString
        variables
        cachedData
        options
        networkStatus
        error {
          networkError
          clientErrors
          graphQLErrors {
            message
            path
          }
          protocolErrors
        }
      }
    }
  }
`;

interface QueriesProps {
  explorerIFrame: HTMLIFrameElement | null;
}

export const Queries = ({ explorerIFrame }: QueriesProps) => {
  const [selected, setSelected] = useState<number>(0);
  const { data } = useQuery(GET_WATCHED_QUERIES, { returnPartialData: true });

  const queries = data?.watchedQueries.queries ?? [];
  const selectedQuery = queries.find((query) => query.id === selected);
  const [currentTab, setCurrentTab] = useState<QueryTabs>(QueryTabs.Variables);
  const copyButtonText = JSON.stringify(
    currentTab === QueryTabs.Variables
      ? selectedQuery?.variables ?? {}
      : selectedQuery?.cachedData ?? {}
  );

  return (
    <SidebarLayout>
      <SidebarLayout.Sidebar>
        <List className="h-full">
          {queries.map(({ name, id, networkStatus }) => {
            return (
              <ListItem
                key={`${name}-${id}`}
                onClick={() => setSelected(id)}
                selected={selected === id}
                className="font-code"
              >
                <div className="w-full flex items-center justify-between">
                  {name}
                  <QueryStatusIcon networkStatus={networkStatus} />
                </div>
              </ListItem>
            );
          })}
        </List>
      </SidebarLayout.Sidebar>
      <QueryLayout>
        {selectedQuery ? (
          <>
            <QueryLayout.Header>
              <QueryLayout.Title>{selectedQuery.name}</QueryLayout.Title>
              <RunInExplorerButton
                operation={selectedQuery.queryString}
                variables={selectedQuery.variables ?? undefined}
                embeddedExplorerIFrame={explorerIFrame}
              />
            </QueryLayout.Header>
            <QueryLayout.QueryString code={selectedQuery.queryString} />
          </>
        ) : (
          <EmptyMessage className="m-auto mt-20" />
        )}
        <QueryLayout.Tabs
          value={currentTab}
          onChange={(value) => setCurrentTab(value)}
        >
          <Tabs.List>
            <Tabs.Trigger value={QueryTabs.Variables}>Variables</Tabs.Trigger>
            <Tabs.Trigger value={QueryTabs.CachedData}>
              Cached Data
            </Tabs.Trigger>
            <Tabs.Trigger value={QueryTabs.Options}>Options</Tabs.Trigger>
            <CopyButton
              className="ml-auto relative right-[6px]"
              size="sm"
              text={copyButtonText}
            />
          </Tabs.List>
          <QueryLayout.TabContent value={QueryTabs.Variables}>
            <JSONTreeViewer
              hideRoot={!isEmpty(selectedQuery?.variables)}
              className="[&>li]:!pt-0"
              data={selectedQuery?.variables ?? {}}
            />
          </QueryLayout.TabContent>
          <QueryLayout.TabContent value={QueryTabs.CachedData}>
            <JSONTreeViewer
              hideRoot={!isEmpty(selectedQuery?.cachedData)}
              className="[&>li]:!pt-0"
              data={selectedQuery?.cachedData ?? {}}
            />
          </QueryLayout.TabContent>
          <QueryLayout.TabContent value={QueryTabs.Options}>
            <JSONTreeViewer
              hideRoot={!isEmpty(selectedQuery?.options)}
              className="[&>li]:!pt-0"
              data={selectedQuery?.options ?? {}}
            />
          </QueryLayout.TabContent>
        </QueryLayout.Tabs>
      </QueryLayout>
    </SidebarLayout>
  );
};

interface QueryStatusIconProps {
  networkStatus: NetworkStatus;
}

const QueryStatusIcon = ({ networkStatus }: QueryStatusIconProps) => {
  if (isNetworkRequestInFlight(networkStatus)) {
    return <Spinner size="xs" />;
  }

  if (networkStatus === NetworkStatus.error) {
    return (
      <IconErrorSolid className="size-4 text-icon-error dark:text-icon-error-dark" />
    );
  }

  return null;
};
