import { Fragment, useState } from "react";
import { gql, useQuery, TypedDocumentNode } from "@apollo/client";
import { List } from "../List";
import { ListItem } from "../ListItem";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "./RunInExplorerButton";
import { GetWatchedQueries, GetWatchedQueriesVariables } from "../../types/gql";
import { CodeBlock } from "../CodeBlock";
import { Tabs } from "../Tabs";
import CopyToClipboard from "react-copy-to-clipboard";
import { Button } from "../Button";
import { CopyIcon } from "../icons/Copy";
import { JSONTreeViewer } from "../JSONTreeViewer";
import clsx from "clsx";

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
  embeddedExplorerProps: {
    embeddedExplorerIFrame: HTMLIFrameElement | null;
  };
}

export const Queries = ({ embeddedExplorerProps }: QueriesProps) => {
  const [selected, setSelected] = useState<number>(0);
  const { data } = useQuery(GET_WATCHED_QUERIES, { returnPartialData: true });

  const queries = data?.watchedQueries.queries ?? [];
  const selectedQuery = queries.find((query) => query.id === selected);
  const [currentTab, setCurrentTab] = useState<QueryTabs>(QueryTabs.Variables);

  return (
    <SidebarLayout>
      <SidebarLayout.Sidebar>
        <List>
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
      <SidebarLayout.Main
        className={clsx(
          "grid gap-x-6 gap-y-2 !overflow-y-auto !overflow-x-hidden [grid-template-areas:'header'_'content'_'tabs'] [grid-template-columns:minmax(0,1fr)] [grid-template-rows:auto_auto_minmax(0,1fr)]",
          "lg:[grid-template-areas:'header_tabs'_'content_tabs'] lg:[grid-template-columns:1fr_262px] lg:[grid-template-rows:auto_minmax(0,1fr)]"
        )}
      >
        {selectedQuery && (
          <Fragment>
            <div className="flex items-center justify-between [grid-area:header]">
              <h1 className="prose-2xl text-heading dark:text-heading-dark">
                <code>{selectedQuery.name}</code>
              </h1>
              <RunInExplorerButton
                operation={selectedQuery.queryString}
                variables={selectedQuery.variables ?? undefined}
                embeddedExplorerIFrame={
                  embeddedExplorerProps.embeddedExplorerIFrame
                }
              />
            </div>
            <div className="[grid-area:content] max-h-[500px]">
              <CodeBlock
                language="graphql"
                code={selectedQuery.queryString}
                className="max-h-full"
              />
            </div>
            <Tabs
              className="[grid-area:tabs] lg:overflow-hidden lg:-my-2"
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
                <CopyToClipboard
                  text={`${JSON.stringify(
                    currentTab === QueryTabs.Variables
                      ? selectedQuery.variables
                      : selectedQuery.cachedData
                  )}`}
                >
                  <Button
                    size="sm"
                    variant="hidden"
                    data-testid="copy-query-data"
                  >
                    <CopyIcon className="h-4" />
                  </Button>
                </CopyToClipboard>
              </Tabs.List>
              <Tabs.Content
                className="text-sm py-4 lg:flex-1 lg:overflow-auto"
                value={QueryTabs.Variables}
              >
                <JSONTreeViewer
                  className="[&>li]:!pt-0"
                  data={selectedQuery.variables}
                />
              </Tabs.Content>
              <Tabs.Content
                className="text-sm py-4 lg:flex-1 lg:overflow-auto"
                value={QueryTabs.CachedData}
              >
                <JSONTreeViewer
                  className="[&>li]:!pt-0"
                  data={selectedQuery.cachedData}
                />
              </Tabs.Content>
            </Tabs>
          </Fragment>
        )}
      </SidebarLayout.Main>
    </SidebarLayout>
  );
};
