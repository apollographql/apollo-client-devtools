import type { ReactNode } from "react";
import { Fragment, useState, useMemo } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { gql, useQuery } from "@apollo/client";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { SearchField } from "../SearchField";
import { EntityList } from "./sidebar/EntityList";
import { Loading } from "./common/Loading";
import type { GetCache, GetCacheVariables } from "../../types/gql";
import type { JSONObject } from "../../types/json";
import { JSONTreeViewer } from "../JSONTreeViewer";
import clsx from "clsx";
import { CopyButton } from "../CopyButton";
import { EmptyMessage } from "../EmptyMessage";

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
      <Sidebar className="flex flex-col h-full">
        {loading ? (
          <Loading />
        ) : dataExists ? (
          <Fragment>
            <SearchField
              className="mb-4"
              placeholder="Search queries"
              onChange={setSearchTerm}
              value={searchTerm}
            />
            <div className="overflow-auto h-full">
              <EntityList
                data={filteredCache}
                selectedCacheId={cacheId}
                setCacheId={setCacheId}
                searchTerm={searchTerm}
              />
            </div>
          </Fragment>
        ) : null}
      </Sidebar>
      <Main className="!overflow-auto">
        {dataExists ? (
          <div className="flex items-start justify-between mb-2 gap-2">
            <div>
              <div className="text-xs font-bold uppercase">Cache ID</div>
              <h1
                className="font-code font-medium text-xl text-heading dark:text-heading-dark break-all"
                data-testid="cache-id"
              >
                {cacheId}
              </h1>
            </div>
            <CopyButton size="md" text={JSON.stringify(cache[cacheId])} />
          </div>
        ) : (
          <EmptyMessage className="m-auto mt-20" />
        )}

        {loading ? (
          <Loading />
        ) : dataExists ? (
          <JSONTreeViewer
            data={cache[cacheId]}
            hideRoot={true}
            valueRenderer={(valueAsString, value, key) => {
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
                  {valueAsString as ReactNode}
                </span>
              );
            }}
          />
        ) : null}
      </Main>
    </SidebarLayout>
  );
}
