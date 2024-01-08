/** @jsxImportSource @emotion/react */
import { useState } from "react";
import { css } from "@emotion/react";
import { rem } from "polished";
import SyntaxHighlighter from "../SyntaxHighlighter";
import * as Tabs from "@radix-ui/react-tabs";

import { gql } from "@apollo/client";
import { IconCopy } from "@apollo/space-kit/icons/IconCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { fragmentRegistry } from "../../fragmentRegistry";
import { QueryViewer_query as WatchedQuery } from "../../types/gql";
import { JSONTreeViewer } from "../JSONTreeViewer";

export const headerStyles = css`
  font-size: ${rem(14)};
  font-weight: 600;
  border-bottom: ${rem(1)} solid var(--mainBorder);
`;

export const queryStringHeader = css`
  grid-area: queryStringHeader;
  display: flex;
  justify-content: space-between;
  margin: 0;
  ${headerStyles}
`;

const tabPanelStyles = css`
  outline: none;
  > ul {
    margin-top: 0 !important;
    > li {
      padding-top: 0 !important;
    }
  }
`;

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
      <h4 css={queryStringHeader}>
        Query String
        <CopyToClipboard text={query.queryString}>
          <IconCopy
            className="ml-auto !h-4 cursor-pointer text-secondary dark:text-secondary-dark hover:text-primary hover:dark:text-primary-dark"
            data-testid="copy-query-string"
          />
        </CopyToClipboard>
      </h4>
      <SyntaxHighlighter
        className="[grid-area:queryStringMain] mt-4 text-sm h-full overflow-y-hidden"
        language="graphql"
        code={query.queryString}
      />
      <Tabs.Root
        value={currentTab}
        onValueChange={(value: QueryTabs) => setCurrentTab(value)}
      >
        <Tabs.List className="flex [grid-area:queryDataHeader] h-full text-sm font-semibold border-b-primary dark:border-b-primary-dark border-b">
          <Tabs.Trigger
            className="px-2 pb-2 data-state-active:text-white data-state-active:border-b-focused dark:data-state-active:border-b-focused-dark data-state-active:border-b"
            value={QueryTabs.Variables}
          >
            Variables
          </Tabs.Trigger>
          <Tabs.Trigger
            className="px-2 pb-2 data-state-active:text-white data-state-active:border-b-focused dark:data-state-active:border-b-focused-dark data-state-active:border-b"
            value={QueryTabs.CachedData}
          >
            Cached Data
          </Tabs.Trigger>
          <CopyToClipboard text={copyCurrentTab}>
            <IconCopy
              className="ml-auto !h-4 cursor-pointer text-secondary dark:text-secondary-dark hover:text-primary hover:dark:text-primary-dark"
              data-testid="copy-query-data"
            />
          </CopyToClipboard>
        </Tabs.List>
        <div className="[grid-area:queryDataMain] mt-4 pb-4 text-sm">
          <Tabs.Content css={tabPanelStyles} value={QueryTabs.Variables}>
            <JSONTreeViewer data={query.variables} />
          </Tabs.Content>
          <Tabs.Content css={tabPanelStyles} value={QueryTabs.CachedData}>
            <JSONTreeViewer data={query.cachedData} />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
};
