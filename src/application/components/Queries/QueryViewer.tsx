import { useState } from "react";
import { CodeBlock } from "../CodeBlock";

import { gql } from "@apollo/client";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { fragmentRegistry } from "../../fragmentRegistry";
import { QueryViewer_query as WatchedQuery } from "../../types/gql";
import { JSONTreeViewer } from "../JSONTreeViewer";
import { Tabs } from "../Tabs";
import { Button } from "../Button";
import { CopyIcon } from "../icons/Copy";

interface QueryViewerProps {
  query: WatchedQuery;
}

enum QueryTabs {
  Variables = "Variables",
  CachedData = "CachedData",
}

fragmentRegistry.register(gql`
  fragment QueryViewer_query on WatchedQuery {
    queryString
    variables
    cachedData
  }
`);

export const QueryViewer = ({ query }: QueryViewerProps) => {
  const [currentTab, setCurrentTab] = useState<QueryTabs>(QueryTabs.Variables);
  const copyCurrentTab = `${JSON.stringify(
    currentTab === QueryTabs.Variables ? query.variables : query.cachedData
  )}`;

  return (
    <div className="gap-6 pt-3 grid [grid-template-columns:1fr_350px]">
      <div>
        <CodeBlock
          className="overflow-y-hidden"
          language="graphql"
          code={query.queryString}
        />
      </div>
      <Tabs
        value={currentTab}
        onChange={(value: QueryTabs) => setCurrentTab(value)}
      >
        <Tabs.List>
          <Tabs.Trigger value={QueryTabs.Variables}>Variables</Tabs.Trigger>
          <Tabs.Trigger value={QueryTabs.CachedData}>Cached Data</Tabs.Trigger>
          <CopyToClipboard text={copyCurrentTab}>
            <Button
              className="ml-auto"
              size="sm"
              variant="hidden"
              data-testid="copy-query-data"
            >
              <CopyIcon className="h-4" />
            </Button>
          </CopyToClipboard>
        </Tabs.List>
        <div className="mt-4 pb-4 text-sm">
          <Tabs.Content value={QueryTabs.Variables}>
            <JSONTreeViewer className="[&>li]:!pt-0" data={query.variables} />
          </Tabs.Content>
          <Tabs.Content value={QueryTabs.CachedData}>
            <JSONTreeViewer className="[&>li]:!pt-0" data={query.cachedData} />
          </Tabs.Content>
        </div>
      </Tabs>
    </div>
  );
};
