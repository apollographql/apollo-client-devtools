/** @jsxImportSource @emotion/react */
import { useState } from "react";
import { css } from "@emotion/react";
import { rem } from "polished";
import { colors } from "@apollo/space-kit/colors";
import SyntaxHighlighter from "../SyntaxHighlighter";
import * as Tabs from "@radix-ui/react-tabs";

import { gql } from "@apollo/client";
import { IconCopy } from "@apollo/space-kit/icons/IconCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { fragmentRegistry } from "../../fragmentRegistry";
import { QueryViewer_query as WatchedQuery } from "../../types/gql";
import { JSONTreeViewer } from "../JSONTreeViewer";

export const queryViewStyles = css`
  display: grid;
  grid-template-columns: minmax(12rem, 2fr) minmax(12rem, 1fr);
  grid-template-rows: 1.75rem auto;
  grid-column-gap: ${rem(24)};
  grid-template-areas:
    "queryStringHeader queryDataHeader"
    "queryStringMain queryDataMain";
  padding-top: ${rem(10)};
`;

export const headerStyles = css`
  font-size: ${rem(14)};
  font-weight: 600;
  border-bottom: ${rem(1)} solid var(--mainBorder);
`;

export const copyIconStyle = css`
  height: ${rem(16)} !important;
  color: ${colors.silver.darker};
  cursor: pointer;

  &:hover {
    color: var(--textPrimary);
  }
`;

export const queryStringHeader = css`
  grid-area: queryStringHeader;
  display: flex;
  justify-content: space-between;
  margin: 0;
  ${headerStyles}
`;

export const queryStringMain = css`
  grid-area: queryStringMain;
  margin-top: 1rem;
  font-size: ${rem(13)};
  height: 100%;
  overflow-y: hidden;
`;

export const queryDataMain = css`
  grid-area: queryDataMain;
  margin-top: 1rem;
  padding-bottom: 1rem;
  font-family: "Source Code Pro", monospace;
  font-size: ${rem(13)};
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
          <IconCopy css={copyIconStyle} data-testid="copy-query-string" />
        </CopyToClipboard>
      </h4>
      <SyntaxHighlighter
        css={queryStringMain}
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
              className="ml-auto"
              css={copyIconStyle}
              data-testid="copy-query-data"
            />
          </CopyToClipboard>
        </Tabs.List>
        <div css={queryDataMain}>
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
