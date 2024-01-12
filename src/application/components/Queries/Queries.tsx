import { Fragment, useState } from "react";
import { gql, useQuery, TypedDocumentNode } from "@apollo/client";
import { List } from "../List";
import { ListItem } from "../ListItem";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "./RunInExplorerButton";
import { GetWatchedQueries, GetWatchedQueriesVariables } from "../../types/gql";
import { Tabs } from "../Tabs";
import { JSONTreeViewer } from "../JSONTreeViewer";
import { QueryLayout } from "../QueryLayout";
import { CopyButton } from "../CopyButton";

enum QueryTabs {
  Variables = "Variables",
  CachedData = "CachedData",
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

  return (
    <SidebarLayout>
      <SidebarLayout.Sidebar>
        <List className="h-full">
          {queries.map(({ name, id }) => {
            return (
              <ListItem
                key={`${name}-${id}`}
                onClick={() => setSelected(id)}
                selected={selected === id}
                className="font-code h-8 text-sm"
              >
                {name}
              </ListItem>
            );
          })}
        </List>
      </SidebarLayout.Sidebar>
      <QueryLayout>
        {selectedQuery && (
          <Fragment>
            <QueryLayout.Header>
              <QueryLayout.Title>{selectedQuery.name}</QueryLayout.Title>
              <RunInExplorerButton
                operation={selectedQuery.queryString}
                variables={selectedQuery.variables ?? undefined}
                embeddedExplorerIFrame={explorerIFrame}
              />
            </QueryLayout.Header>
            <QueryLayout.QueryString code={selectedQuery.queryString} />
            <QueryLayout.Tabs
              value={currentTab}
              onChange={(value: QueryTabs) => setCurrentTab(value)}
            >
              <Tabs.List>
                <Tabs.Trigger value={QueryTabs.Variables}>
                  Variables
                </Tabs.Trigger>
                <Tabs.Trigger value={QueryTabs.CachedData}>
                  Cached Data
                </Tabs.Trigger>
                <CopyButton
                  className="ml-auto relative right-[6px]"
                  size="sm"
                  text={`${JSON.stringify(
                    currentTab === QueryTabs.Variables
                      ? selectedQuery.variables
                      : selectedQuery.cachedData
                  )}`}
                />
              </Tabs.List>
              <QueryLayout.TabContent value={QueryTabs.Variables}>
                <JSONTreeViewer
                  className="[&>li]:!pt-0"
                  data={selectedQuery.variables}
                />
              </QueryLayout.TabContent>
              <QueryLayout.TabContent value={QueryTabs.CachedData}>
                <JSONTreeViewer
                  className="[&>li]:!pt-0"
                  data={selectedQuery.cachedData}
                />
              </QueryLayout.TabContent>
            </QueryLayout.Tabs>
          </Fragment>
        )}
      </QueryLayout>
    </SidebarLayout>
  );
};
