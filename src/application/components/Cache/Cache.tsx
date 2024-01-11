import { Fragment, useState, useMemo, ReactNode } from "react";
import { gql, useQuery, TypedDocumentNode } from "@apollo/client";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { SearchField } from "../SearchField";
import { EntityList } from "./sidebar/EntityList";
import { Loading } from "./common/Loading";
import { GetCache, GetCacheVariables } from "../../types/gql";
import { JSONObject } from "../../types/json";
import { JSONTreeViewer } from "../JSONTreeViewer";
import clsx from "clsx";

const { Sidebar, Main } = SidebarLayout;

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

export function Cache() {
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
    <SidebarLayout>
      <Sidebar>
        {loading ? (
          <Loading />
        ) : dataExists ? (
          <Fragment>
            <SearchField
              className="mb-2"
              placeholder="Search queries"
              onChange={setSearchTerm}
              value={searchTerm}
            />
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
      <Main>
        {dataExists ? (
          <h1 className="prose-xl" data-testid="cache-id">
            <code>{cacheId}</code>
          </h1>
        ) : null}

        {loading ? (
          <Loading />
        ) : (
          <JSONTreeViewer
            data={cache[cacheId]}
            hideRoot={true}
            valueRenderer={(valueAsString: ReactNode, value, key) => {
              return (
                <span
                  className={clsx({
                    ["hover:underline hover:cursor-pointer"]: key === "__ref",
                  })}
                  onClick={() => {
                    if (key === "__ref") {
                      setCacheId(value as string);
                    }
                  }}
                >
                  {valueAsString}
                </span>
              );
            }}
          />
        )}
      </Main>
    </SidebarLayout>
  );
}
