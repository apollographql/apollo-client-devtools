/** @jsx jsx */

import { useState } from "react";
import { jsx, css } from "@emotion/react";
import { rem } from "polished";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import { colors } from "@apollo/space-kit/colors";
import { GraphQLCodeBlock } from "react-graphql-syntax-highlighter";
import 'react-graphql-syntax-highlighter/dist/style';

import JSONTree from "react-json-tree";
import { IconCopy } from "@apollo/space-kit/icons/IconCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";
import stringifyObject from "stringify-object";

import { useTreeTheme } from "../../theme";

import "@reach/tabs/styles.css";

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
  height: ${rem(16)};
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
  grid-area: queryDataHeader;
  height: 100%;
  background-color: transparent;
  ${headerStyles}
  color: ${colors.grey.lighter};

  button {
    padding-top: 0;
    padding-bottom: 1.7rem;
    outline: none;
  }

  button[data-selected] {
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
  queryString: string;
  variables: Record<string, any>;
  cachedData: Record<string, any>;
}

enum QueryTabs {
  Variables,
  CachedData,
}

export const QueryViewer = ({
  queryString = "",
  variables = {},
  cachedData = {},
}: QueryViewerProps) => {
  const [currentTab, setCurrentTab] = useState<QueryTabs>(QueryTabs.Variables);
  const copyCurrentTab = `${JSON.stringify(
    currentTab === QueryTabs.Variables ? variables : cachedData
  )}`;
  const treeTheme = useTreeTheme();
  return (
    <div css={queryViewStyles}>
      <h4 css={queryStringHeader}>
        Query String
        <CopyToClipboard text={queryString}>
          <IconCopy css={copyIconStyle} data-testid="copy-query-string" />
        </CopyToClipboard>
      </h4>
      <GraphQLCodeBlock
        className="GraphqlCodeBlock"
        css={queryStringMain}
        src={queryString}
      />
      <Tabs onChange={(index) => setCurrentTab(index)}>
        <TabList css={queryDataHeader}>
          <Tab>Variables</Tab>
          <Tab>Cached Data</Tab>
          <CopyToClipboard text={copyCurrentTab}>
            <IconCopy css={copyIconStyle} data-testid="copy-query-data" />
          </CopyToClipboard>
        </TabList>
        <TabPanels css={queryDataMain}>
          <TabPanel css={tabPanelStyles}>
            <JSONTree data={variables} theme={treeTheme} invertTheme={false} />
          </TabPanel>
          <TabPanel css={tabPanelStyles}>
            <JSONTree data={cachedData} theme={treeTheme} invertTheme={false} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};
