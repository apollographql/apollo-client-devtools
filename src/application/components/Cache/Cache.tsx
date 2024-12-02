import type { ReactNode } from "react";
import { useState, useMemo, useSyncExternalStore } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { gql, useQuery } from "@apollo/client";
import IconArrowLeft from "@apollo/icons/small/IconArrowLeft.svg";
import IconArrowRight from "@apollo/icons/small/IconArrowRight.svg";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { SearchField } from "../SearchField";
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
import { Alert } from "../Alert";
import { List } from "../List";
import { ListItem } from "../ListItem";
import { getRootCacheIds } from "./common/utils";
import HighlightMatch from "../HighlightMatch";
import { useActorEvent } from "../../hooks/useActorEvent";
import { PageSpinner } from "../PageSpinner";
import { isIgnoredError } from "../../utilities/ignoredErrors";

const { Sidebar, Main } = SidebarLayout;

const GET_CACHE: TypedDocumentNode<GetCache, GetCacheVariables> = gql`
  query GetCache($id: ID!) {
    client(id: $id) {
      id
      cache
    }
  }
`;

function filterCache(cache: JSONObject, searchTerm: string) {
  const regex = new RegExp(searchTerm, "i");

  return Object.entries(cache).reduce<JSONObject>(
    (filteredCache, [cacheKey, value]) => {
      if (regex.test(cacheKey)) {
        filteredCache[cacheKey] = value;
      }

      return filteredCache;
    },
    {}
  );
}

const history = new History("ROOT_QUERY");

const STABLE_EMPTY_OBJ: JSONObject = {};

interface CacheProps {
  clientId: string | undefined;
}

export function Cache({ clientId }: CacheProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const cacheId = useSyncExternalStore(history.listen, history.getCurrent);

  const { loading, data, error, startPolling, stopPolling } = useQuery(
    GET_CACHE,
    {
      variables: { id: clientId as string },
      skip: clientId == null,
      pollInterval: 500,
    }
  );

  if (error && !isIgnoredError(error)) {
    throw error;
  }

  useActorEvent("panelHidden", () => stopPolling());
  useActorEvent("panelShown", () => startPolling(500));

  const cache = data?.client?.cache ?? STABLE_EMPTY_OBJ;

  const filteredCache = useMemo(
    () => (searchTerm ? filterCache(cache, searchTerm) : cache),
    [cache, searchTerm]
  );

  const dataExists = Object.keys(cache).length > 0;
  const cacheItem = cache[cacheId];
  const cacheIds = getRootCacheIds(filteredCache);

  return (
    <SidebarLayout>
      <Sidebar className="flex flex-col h-full">
        <SearchField
          className="mb-4"
          placeholder="Search cache"
          onChange={setSearchTerm}
          value={searchTerm}
        />
        <List className="h-full">
          {cacheIds.map((id) => {
            return (
              <ListItem
                key={id}
                onClick={() => history.push(id)}
                selected={id === cacheId}
                className="font-code"
              >
                {searchTerm ? (
                  <HighlightMatch searchTerm={searchTerm} value={id} />
                ) : (
                  id
                )}
              </ListItem>
            );
          })}
        </List>
      </Sidebar>
      <Main className="!overflow-auto flex flex-col">
        {dataExists ? (
          <>
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
              <CopyButton
                size="sm"
                text={JSON.stringify(cacheItem)}
                className={clsx({ invisible: !cacheItem })}
              />
            </div>
            <div className="my-2">
              <div className="text-xs font-bold uppercase">Cache ID</div>
              <h1
                className="font-code font-medium text-xl text-heading dark:text-heading-dark break-all"
                data-testid="cache-id"
              >
                {cacheId}
              </h1>
            </div>
          </>
        ) : null}

        {loading ? (
          <PageSpinner />
        ) : cacheItem ? (
          <JSONTreeViewer
            data={cacheItem}
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
        ) : dataExists ? (
          <Alert variant="error" className="mt-4">
            This cache entry was either removed from the cache or does not
            exist.
          </Alert>
        ) : (
          <EmptyMessage className="m-auto mt-20" />
        )}
      </Main>
    </SidebarLayout>
  );
}
