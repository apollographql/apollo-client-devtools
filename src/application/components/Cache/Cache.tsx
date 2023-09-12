import { Fragment, useState, useMemo } from "react";
import { gql, useQuery, TypedDocumentNode } from "@apollo/client";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { Search } from "./sidebar/Search";
import { EntityList } from "./sidebar/EntityList";
import { EntityView } from "./main/EntityView";
import { Loading } from "./common/Loading";
import { GetCache, GetCacheVariables } from "../../types/gql";
import { JSONObject } from "../../types/json";

const { Header, Sidebar, Main, Content } = SidebarLayout;

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
          <h3 className="ml-3 uppercase text-sm font-normal pt-4 text-white/50 tracking-wider">
            No cache data
          </h3>
        )}
      </Sidebar>
      <Content>
        <Header>
          {dataExists ? (
            <Fragment>
              <h1 className="font-monospace font-normal text-xl">
                <code>{cacheId || undefined}</code>
              </h1>
              <span className="font-sans text-grey-light uppercase text-xs mt-1 ml-2">
                CACHE ID
              </span>
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
