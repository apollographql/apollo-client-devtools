import { useState } from "react";
import { css } from "@emotion/react";
import { rem } from "polished";
import { colors } from "@apollo/space-kit/colors";
import SyntaxHighlighter from "../SyntaxHighlighter";
import * as Tabs from "@radix-ui/react-tabs";

import { gql } from "@apollo/client";
import { JSONTree } from "react-json-tree";
import { IconCopy } from "@apollo/space-kit/icons/IconCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { useTreeTheme } from "../../theme";
import { fragmentRegistry } from "../../fragmentRegistry";
import { QueryViewer_query as WatchedQuery } from "../../types/gql";

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

const queryDataHeader = css`
  display: flex;
  grid-area: queryDataHeader;
  height: 100%;
  background-color: transparent;
  ${headerStyles}
  color: ${colors.grey.lighter};

  button {
    padding: 0 0.5em 1.7rem;
    outline: none;
    display: inline-block;
    border: none;
    margin: 0;
    border-bottom: 1px solid transparent;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  button[data-state="active"] {
    color: var(--textPrimary);
    border-bottom: ${rem(1)} solid var(--textPrimary);
  }

  svg {
    margin-right: 0;
    margin-left: auto;
  }
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
  const treeTheme = useTreeTheme();
  return (
    <div css={queryViewStyles}>
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
        <Tabs.List css={queryDataHeader}>
          <Tabs.Trigger value={QueryTabs.Variables}>Variables</Tabs.Trigger>
          <Tabs.Trigger value={QueryTabs.CachedData}>Cached Data</Tabs.Trigger>
          <CopyToClipboard text={copyCurrentTab}>
            <IconCopy css={copyIconStyle} data-testid="copy-query-data" />
          </CopyToClipboard>
        </Tabs.List>
        <div css={queryDataMain}>
          <Tabs.Content css={tabPanelStyles} value={QueryTabs.Variables}>
            <JSONTree
              data={query.variables}
              theme={treeTheme}
              invertTheme={false}
            />
          </Tabs.Content>
          <Tabs.Content css={tabPanelStyles} value={QueryTabs.CachedData}>
            <JSONTree
              data={query.cachedData}
              theme={treeTheme}
              invertTheme={false}
            />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
};
