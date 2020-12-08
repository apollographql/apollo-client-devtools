/** @jsx jsx */
import React, { useState } from "react";
import { jsx, css } from "@emotion/core";
import { gql, useQuery } from "@apollo/client";

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

  return (
    <SidebarLayout navigationProps={navigationProps}>
      <Header>
        <h1 css={h1Styles}>{cacheId || undefined}</h1>
      </Header>
      <Sidebar cssOverride={sidebarStyles}>
        <Search data={parsedData} setSearchResults={setSearchResults} />
        {loading ? (
          <Loading />
        ) : (
          <EntityList
            data={parsedData}
            cacheId={cacheId}
            setCacheId={setCacheId}
            searchResults={searchResults}
          />
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
