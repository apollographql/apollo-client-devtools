/** @jsx jsx */
import { Fragment, useState } from "react";
import { jsx, css } from "@emotion/core";
import { gql, useQuery } from "@apollo/client";
import { rem } from "polished";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { Search } from "./sidebar/Search";
import { EntityList } from "./sidebar/EntityList";
import { EntityView } from "./main/EntityView";
import { Loading } from "./common/Loading";
import { convertCacheJsonIntoObject } from "./common/utils";

const { Header, Sidebar, Main } = SidebarLayout;

const sidebarStyles = css`
  padding-top: 0;
`;

const h1Styles = css`
  font-family: monospace;
  font-weight: normal;
`;

const noDataStyles = css`
  margin-left: ${rem(12)};
  text-transform: uppercase;
  font-size: ${rem(13)};
  font-weight: normal;
  letter-spacing: ${rem(1)};
  color: var(--whiteTransparent);
  padding-top: ${rem(16)};
`;

const GET_CACHE = gql`
  query GetCache {
    cache @client
  }
`;

export function Cache({ navigationProps }) {
  const [searchResults, setSearchResults] = useState({});
  const [cacheId, setCacheId] = useState<string>("ROOT_QUERY");

  const { loading, data } = useQuery(GET_CACHE);

  let parsedData: Record<string, any> = {};
  if (!loading && data && data.cache) {
    parsedData = convertCacheJsonIntoObject(data.cache);
  }

  const dataExists = parsedData && Object.keys(parsedData).length > 0;

  return (
    <SidebarLayout navigationProps={navigationProps}>
      <Header>
        {dataExists ? <h1 css={h1Styles}>{cacheId || undefined}</h1> : null}
      </Header>
      <Sidebar css={sidebarStyles}>
        {loading ? (
          <Loading />
        ) : dataExists ? (
          <Fragment>
            <Search data={parsedData} setSearchResults={setSearchResults} />
            <EntityList
              data={parsedData}
              cacheId={cacheId}
              setCacheId={setCacheId}
              searchResults={searchResults}
            />
          </Fragment>
        ) : (
          <h3 css={noDataStyles}>No cache data</h3>
        )}
      </Sidebar>
      <Main>
        {loading ? (
          <Loading />
        ) : (
          <EntityView
            cacheId={cacheId}
            data={parsedData[cacheId]}
            searchResults={searchResults}
          />
        )}
      </Main>
    </SidebarLayout>
  );
}
