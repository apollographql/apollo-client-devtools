import type { FC } from "react";
import { useState, useMemo, useSyncExternalStore, memo } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { gql, NetworkStatus } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import IconArrowLeft from "@apollo/icons/small/IconArrowLeft.svg";
import IconArrowRight from "@apollo/icons/small/IconArrowRight.svg";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { SearchField } from "../SearchField";
import type {
  CacheWritesSubscription,
  CacheWritesSubscriptionVariables,
  GetCache,
  GetCacheVariables,
} from "../../types/gql";
import type { JSONObject } from "../../types/json";
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
import { useIsExtensionInvalidated } from "@/application/machines/devtoolsMachine";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { CacheWritesPanel } from "./common/CacheWritesPanel";
import type { Path } from "../ObjectViewer";
import { ObjectViewer } from "../ObjectViewer";

const { Sidebar, Main } = SidebarLayout;

const GET_CACHE: TypedDocumentNode<GetCache, GetCacheVariables> = gql`
  query GetCache($id: ID!) {
    client(id: $id) {
      id
      cache
      cacheWrites @nonreactive {
        ...CacheWritesPanelFragment
      }
    }
  }
`;

const CACHE_WRITES_SUBSCRIPTION: TypedDocumentNode<
  CacheWritesSubscription,
  CacheWritesSubscriptionVariables
> = gql`
  subscription CacheWritesSubscription($clientId: ID!) {
    cacheWritten(clientId: $clientId) {
      id
      ...CacheWritesPanelFragment
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
  const [cancelSubscription, setCancelSubscription] = useState<() => void>();
  const cacheId = useSyncExternalStore(history.listen, history.getCurrent);
  const isExtensionInvalidated = useIsExtensionInvalidated();

  const {
    networkStatus,
    data,
    error,
    startPolling,
    stopPolling,
    subscribeToMore,
  } = useQuery(GET_CACHE, {
    variables: { id: clientId as string },
    skip: clientId == null,
    pollInterval: 500,
    fetchPolicy: isExtensionInvalidated ? "cache-only" : "cache-first",
  });

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
  const cacheWrites = data?.client?.cacheWrites ?? [];

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
      <Main className="!p-0">
        <PanelGroup direction="horizontal" autoSaveId="cacheLayout">
          <Panel
            id="cacheData"
            minSize={25}
            className="!overflow-auto flex flex-col p-4"
            data-testid="main-content"
          >
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

            {networkStatus === NetworkStatus.loading ? (
              <PageSpinner />
            ) : cacheItem ? (
              <CacheItem value={cacheItem} />
            ) : dataExists ? (
              <Alert variant="error" className="mt-4">
                This cache entry was either removed from the cache or does not
                exist.
              </Alert>
            ) : (
              <EmptyMessage className="m-auto mt-20" />
            )}
          </Panel>
          <PanelResizeHandle
            className="border-r border-primary dark:border-primary-dark"
            // Fix issue in tests which prevent the search input onChange
            // handler from firing
            disabled={process.env.NODE_ENV === "test"}
          />
          <CacheWritesPanel
            client={data?.client}
            cacheWrites={cacheWrites}
            isRecording={!!cancelSubscription}
            onToggleRecord={() => {
              setCancelSubscription((cancelSubscription) => {
                if (cancelSubscription) {
                  cancelSubscription();
                  // Clear the cancelSubscription function
                  return;
                }

                if (data?.client) {
                  return subscribeToMore({
                    document: CACHE_WRITES_SUBSCRIPTION,
                    variables: { clientId: data.client.id },
                    updateQuery: (
                      _,
                      { complete, subscriptionData, previousData }
                    ) => {
                      if (complete && previousData.client) {
                        return {
                          ...previousData,
                          client: {
                            ...previousData.client,
                            // the merge function handles concatenating this
                            // cache write with the existing values
                            cacheWrites: [subscriptionData.data.cacheWritten],
                          },
                        };
                      }
                    },
                  });
                }
              });
            }}
          />
        </PanelGroup>
      </Main>
    </SidebarLayout>
  );
}

const CacheItem = memo(({ value }: { value: unknown }) => {
  return <ObjectViewer value={value} builtinRenderers={{ string: RefLink }} />;
});

function RefLink({
  path,
  value,
  DefaultRender,
}: {
  value: string;
  path: Path;
  DefaultRender: FC<{
    className?: string;
    onClick?: () => void;
  }>;
}) {
  const key = path.at(-1);

  return (
    <DefaultRender
      className={clsx({
        ["hover:underline hover:cursor-pointer"]: key === "__ref",
      })}
      onClick={() => {
        if (key === "__ref") {
          history.push(value);
        }
      }}
    />
  );
}
