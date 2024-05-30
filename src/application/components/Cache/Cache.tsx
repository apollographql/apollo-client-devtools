import type { ReactNode } from "react";
import { Fragment, useState, useMemo, useSyncExternalStore } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { gql, useQuery } from "@apollo/client";
import IconArrowLeft from "@apollo/icons/small/IconArrowLeft.svg";
import IconArrowRight from "@apollo/icons/small/IconArrowRight.svg";

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
import { History } from "../../utilities/history";
import { Button } from "../Button";
import { ButtonGroup } from "../ButtonGroup";
import { Tooltip } from "../Tooltip";

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
  const [history] = useState(() => new History("ROOT_QUERY"));

  const cacheId = useSyncExternalStore(history.listen, () =>
    history.getCurrent()
  );

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
                setCacheId={(cacheId) => history.push(cacheId)}
                searchTerm={searchTerm}
              />
            </div>
          </Fragment>
        ) : null}
      </Sidebar>
      <Main className="!overflow-auto">
        <div className="flex items-start justify-between">
          <ButtonGroup>
            <Tooltip content="Go back" delayDuration={500}>
              <Button
                aria-label="Go back"
                icon={<IconArrowLeft />}
                size="xs"
                variant="secondary"
                disabled={!history.canGoBack()}
                onClick={() => history.back()}
              />
            </Tooltip>
            <Tooltip content="Go forward" delayDuration={500}>
              <Button
                aria-label="Go forward"
                icon={<IconArrowRight />}
                size="xs"
                variant="secondary"
                disabled={!history.canGoForward()}
                onClick={() => history.forward()}
              />
            </Tooltip>
          </ButtonGroup>
          {dataExists && (
            <CopyButton size="sm" text={JSON.stringify(cache[cacheId])} />
          )}
        </div>
        {dataExists ? (
          <div className="my-2">
            <div className="text-xs font-bold uppercase">Cache ID</div>
            <h1
              className="font-code font-medium text-xl text-heading dark:text-heading-dark break-all"
              data-testid="cache-id"
            >
              {cacheId}
            </h1>
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
                      history.push(value as string);
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
