/** @jsx jsx */
import { useState } from "react";
import { jsx, css } from "@emotion/core";
import { rem } from "polished";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";
import { colors } from "@apollo/space-kit/colors";
import { GraphqlCodeBlock } from "graphql-syntax-highlighter-react";
import JSONTree from "react-json-tree";
import { IconCopy } from "@apollo/space-kit/icons/IconCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";
import stringifyObject from "stringify-object";

const queryViewStyles = css`
  display: grid;
  grid-template-columns: minmax(${rem(600)}, auto) minmax(${rem(360)}, auto);
  grid-template-rows: ${rem(32)} auto;
  grid-column-gap: ${rem(24)};
  grid-template-areas:
    "queryStringHeader queryDataHeader"
    "queryStringMain queryDataMain";
  margin-top: ${rem(24)};
`;

const headerStyles = css`
  font-size: ${rem(16)};
  font-weight: 600;
  border-bottom: ${rem(1)} solid ${colors.silver.darker};
`;

const copyIconStyle = css`
  height: ${rem(16)};
  color: ${colors.silver.darker};
  cursor: pointer;

  &:hover {
    color: ${colors.black.base};
  }
`;

const queryStringHeader = css`
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
    padding-bottom: ${rem(24)};
  }

  button[data-selected] {
    color: ${colors.black.base};
    border-bottom: ${rem(1)} solid ${colors.black.base};
  }

  svg {
    margin-right: 0;
    margin-left: auto;
  }
`;

const queryStringMain = css`
  grid-area: queryStringMain;
  margin-top: ${rem(24)};
  font-size: ${rem(15)};
`;

const queryDataMain = css`
  grid-area: queryDataMain;
  margin-top: ${rem(24)};
  font-family: "Source Code Pro", monospace;
  font-size: ${rem(15)};
`;

enum QueryTabs {
  Variables,
  CachedData
}

export const QueryViewer = ({ queryString = '', variables = {}, cachedData = {} }) => {
  const [currentTab, setCurrentTab] = useState<QueryTabs>(QueryTabs.Variables);
  const copyCurrentTab = `${stringifyObject(currentTab === QueryTabs.Variables ? variables : cachedData)}`;

  return (
    <div css={queryViewStyles}>
      <h4 css={queryStringHeader}>
        Query String 
        <CopyToClipboard text={queryString}>
          <IconCopy css={copyIconStyle} data-testid="copy-query-string" />
        </CopyToClipboard> 
      </h4>
      <GraphqlCodeBlock
        className="GraphqlCodeBlock"
        css={queryStringMain}
        queryBody={queryString}
      />
      <Tabs onChange={index => setCurrentTab(index)}>
        <TabList css={queryDataHeader}>
          <Tab>Variables</Tab>
          <Tab>Cached Data</Tab>
          <CopyToClipboard text={copyCurrentTab}>
            <IconCopy css={copyIconStyle} data-testid="copy-query-data" />
          </CopyToClipboard> 
        </TabList>
        <TabPanels css={queryDataMain}>
          <TabPanel>
            <JSONTree data={variables} />
          </TabPanel>
          <TabPanel>
            <JSONTree data={cachedData} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};