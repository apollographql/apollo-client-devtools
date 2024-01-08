import { useState } from "react";
import { CodeBlock } from "../CodeBlock";

import { gql } from "@apollo/client";
import { IconCopy } from "@apollo/space-kit/icons/IconCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { fragmentRegistry } from "../../fragmentRegistry";
import { QueryViewer_query as WatchedQuery } from "../../types/gql";
import { JSONTreeViewer } from "../JSONTreeViewer";
import { Tabs } from "../Tabs";

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
    <div className="pt-3 grid [grid-template-columns:minmax(12rem,2fr)_minmax(12rem,1fr)] [grid-template-rows:1.75rem_auto] gap-x-6 [grid-template-areas:'queryStringHeader_queryDataHeader'_'queryStringMain_queryDataMain']">
      <h4 className="[grid-area:queryStringHeader] flex justify-between m-0 text-sm font-bold border-b border-b-primary dark:border-b-primary-dark">
        Query String
        <CopyToClipboard text={query.queryString}>
          <IconCopy
            className="ml-auto !h-4 cursor-pointer text-secondary dark:text-secondary-dark hover:text-primary hover:dark:text-primary-dark"
            data-testid="copy-query-string"
          />
        </CopyToClipboard>
      </h4>
      <CodeBlock
        className="[grid-area:queryStringMain] mt-4 text-sm h-full overflow-y-hidden"
        language="graphql"
        code={query.queryString}
      />
      <Tabs
        className="[grid-area:queryDataHeader]"
        value={currentTab}
        onChange={(value: QueryTabs) => setCurrentTab(value)}
      >
        <Tabs.List>
          <Tabs.Trigger value={QueryTabs.Variables}>Variables</Tabs.Trigger>
          <Tabs.Trigger value={QueryTabs.CachedData}>Cached Data</Tabs.Trigger>
          <CopyToClipboard text={copyCurrentTab}>
            <IconCopy
              className="ml-auto !h-4 cursor-pointer text-secondary dark:text-secondary-dark hover:text-primary hover:dark:text-primary-dark"
              data-testid="copy-query-data"
            />
          </CopyToClipboard>
        </Tabs.List>
        <div className="[grid-area:queryDataMain] mt-4 pb-4 text-sm">
          <Tabs.Content value={QueryTabs.Variables}>
            <JSONTreeViewer
              className="[&>li]:!pt-0"
              style={{ marginTop: 0 }}
              data={query.variables}
            />
          </Tabs.Content>
          <Tabs.Content value={QueryTabs.CachedData}>
            <JSONTreeViewer
              className="[&>li]:!pt-0"
              style={{ marginTop: 0 }}
              data={query.cachedData}
            />
          </Tabs.Content>
        </div>
      </Tabs>
    </div>
  );
};
