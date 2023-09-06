import { Fragment, useMemo, useState } from "react";
import { css } from "@emotion/react";
import { gql, TypedDocumentNode, useQuery } from "@apollo/client";
import { rem } from "polished";
import { colors } from "@apollo/space-kit/colors";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { Search } from "./sidebar/Search";
import { EntityList } from "./sidebar/EntityList";
import { EntityView } from "./main/EntityView";
import { Loading } from "./common/Loading";
import { GetCache, GetCacheVariables } from "../../types/gql";
import { JSONObject } from "../../types/json";

const { Header, Sidebar, Main, Content } = SidebarLayout;

const h1Styles = css`
  font-family: monospace;
  font-weight: normal;
  font-size: ${rem(20)};
`;

const headerLabelStyles = css`
  margin: ${rem(3)} 0 0 ${rem(8)};
  font-family: "Source Sans Pro", sans-serif;
  color: ${colors.grey.light};
  text-transform: uppercase;
  font-size: ${rem(11)};
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

const GET_CACHE: TypedDocumentNode<GetCache, GetCacheVariables> = gql`
  query GetCache {
    cache @client
  }
`;

type Cache = Record<string, JSONObject>;

function filterCache(cache: Cache, searchTerm: string) {
  const regex = new RegExp(searchTerm, "i");

  return Object.entries(cache).reduce<Cache>(
    (filteredCache, [cacheKey, value]) => {
      if (regex.test(cacheKey)) {
        filteredCache[cacheKey] = value;
      }

      return filteredCache;
    },
    {}
  );
}

export function Cache({
  navigationProps,
}: {
  navigationProps: {
    queriesCount: number;
    mutationsCount: number;
  };
}): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const [cacheId, setCacheId] = useState("ROOT_QUERY");

  const { loading, data } = useQuery(GET_CACHE);
  const cache = useMemo(
    () => (data?.cache ? (JSON.parse(data.cache) as Cache) : {}),
    [data?.cache]
  );

  const filteredCache = useMemo(
    () => (searchTerm ? filterCache(cache, searchTerm) : cache),
    [cache, searchTerm]
  );

  const dataExists = Object.keys(cache).length > 0;

  return (
    <SidebarLayout navigationProps={navigationProps}>
      <Sidebar navigationProps={navigationProps}>
        {loading ? (
          <Loading />
        ) : dataExists ? (
          <Fragment>
            <Search onChange={setSearchTerm} value={searchTerm} />
            <EntityList
              data={filteredCache}
              selectedCacheId={cacheId}
              setCacheId={setCacheId}
              searchTerm={searchTerm}
            />
          </Fragment>
        ) : (
          <h3 css={noDataStyles}>No cache data</h3>
        )}
      </Sidebar>
      <Content>
        <Header>
          {dataExists ? (
            <Fragment>
              <h1 css={h1Styles}>{cacheId || undefined}</h1>
              <span css={headerLabelStyles}>CACHE ID</span>
            </Fragment>
          ) : null}
        </Header>
        <Main>
          {loading ? (
            <Loading />
          ) : (
            <EntityView
              cacheId={cacheId}
              data={cache[cacheId]}
              setCacheId={setCacheId}
            />
          )}
        </Main>
      </Content>
    </SidebarLayout>
  );
}
