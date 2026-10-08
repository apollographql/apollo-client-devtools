import { type RefObject, useEffect, useMemo, useState } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { NetworkStatus, gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
  canonicalStringify,
  isNetworkRequestInFlight,
} from "@apollo/client/utilities";
import { List } from "../List";
import { ListItem } from "../ListItem";
import IconErrorSolid from "@apollo/icons/default/IconErrorSolid.svg";
import IconTime from "@apollo/icons/default/IconTime.svg";
import IconChevronLeft from "@apollo/icons/default/IconChevronLeft.svg";
import IconChevronRight from "@apollo/icons/default/IconChevronRight.svg";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "./RunInExplorerButton";
import type { GetQueries, GetQueriesVariables } from "../../types/gql";
import { Tabs } from "../Tabs";
import { QueryLayout } from "../QueryLayout";
import { CopyButton } from "../CopyButton";
import { EmptyMessage } from "../EmptyMessage";
import { Spinner } from "../Spinner";
import { StatusBadge } from "../StatusBadge";
import { AlertDisclosure } from "../AlertDisclosure";
import { Tooltip } from "../Tooltip";
import { ApolloErrorAlertDisclosurePanel } from "../ApolloErrorAlertDisclosurePanel";
import { useActorEvent } from "../../hooks/useActorEvent";
import { SearchField } from "../SearchField";
import HighlightMatch from "../HighlightMatch";
import { PageSpinner } from "../PageSpinner";
import { isIgnoredError } from "../../utilities/ignoredErrors";
import { SerializedErrorAlertDisclosurePanel } from "../SerializedErrorAlertDisclosurePanel";
import { useIsExtensionInvalidated } from "@/application/machines/devtoolsMachine";
import { ObjectViewer } from "../ObjectViewer";
import { VariablesObject } from "../VariablesObject";
import { type Explorer } from "../Explorer/Explorer";
import { Badge } from "../Badge";
import { Button } from "../Button";
import {
  Screens,
  clearNavigationTarget,
  useNavigationTarget,
} from "../Layouts/Navigation";

enum QueryTabs {
  Variables = "Variables",
  CachedData = "CachedData",
  Options = "Options",
}

export const GET_QUERIES: TypedDocumentNode<GetQueries, GetQueriesVariables> =
  gql`
    query GetQueries($clientId: ID!) {
      client(id: $clientId) {
        id
        queries {
          items {
            id
            name
            queryString
            variables
            cachedData
            options
            networkStatus
            pollInterval
            ... on ClientV3WatchedQuery {
              error {
                ...ApolloErrorAlertDisclosurePanel_error
              }
            }
            ... on ClientV4WatchedQuery {
              error {
                ...SerializedErrorAlertDisclosurePanel_error
              }
            }
          }
        }
      }
    }

    ${ApolloErrorAlertDisclosurePanel.fragments.error}
  `;

interface QueriesProps {
  clientId: string | undefined;
  explorerRef: RefObject<Explorer.Ref | null>;
}

type Query = NonNullable<GetQueries["client"]>["queries"]["items"][number];

const STABLE_EMPTY_QUERIES: Query[] = [];

// Queries with the same name and variables are grouped so that repeat watches
// (e.g. the same `useQuery` hook used by many components) stand out with a
// count. Groups with the most watches come first.
function groupRepeatWatches(queries: Query[]) {
  const groups = new Map<string, Query[]>();

  queries.forEach((query) => {
    const key = `${query.name ?? ""}:${canonicalStringify(query.variables ?? {})}`;
    const group = groups.get(key);

    if (group) {
      group.push(query);
    } else {
      groups.set(key, [query]);
    }
  });

  // `sort` is stable so groups with the same count keep their original order
  return Array.from(groups.values()).sort((a, b) => b.length - a.length);
}

// Show the most relevant status for a group: in flight, then error, then the
// first query (e.g. polling)
function getGroupStatusQuery(group: Query[]) {
  return (
    group.find((query) => isNetworkRequestInFlight(query.networkStatus)) ??
    group.find((query) => query.networkStatus === NetworkStatus.error) ??
    group[0]
  );
}

export const Queries = ({ clientId, explorerRef }: QueriesProps) => {
  const [selected, setSelected] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const isExtensionInvalidated = useIsExtensionInvalidated();

  const { error, data, startPolling, stopPolling, networkStatus } = useQuery(
    GET_QUERIES,
    {
      variables: { clientId: clientId as string },
      skip: clientId == null,
      pollInterval: isExtensionInvalidated ? 0 : 500,
      fetchPolicy: isExtensionInvalidated ? "cache-only" : "cache-first",
    }
  );

  if (error && !isIgnoredError(error)) {
    throw error;
  }

  const queries = data?.client?.queries.items ?? STABLE_EMPTY_QUERIES;
  const selectedQuery = queries.find((query) => query.id === selected);
  const [currentTab, setCurrentTab] = useState<QueryTabs>(QueryTabs.Variables);
  const copyButtonText = JSON.stringify(
    currentTab === QueryTabs.Variables
      ? selectedQuery?.variables ?? {}
      : currentTab === QueryTabs.Options
        ? selectedQuery?.options ?? {}
        : selectedQuery?.cachedData ?? {}
  );

  const pollInterval = selectedQuery?.pollInterval;

  useActorEvent("panelHidden", () => stopPolling());
  useActorEvent("panelShown", () => startPolling(500));

  // Opened from another tab (e.g. Performance) with a query to select. Select
  // the group with the most watches for that name.
  const targetName = useNavigationTarget(Screens.Queries);

  const targetGroup =
    targetName && data
      ? groupRepeatWatches(queries).find(
          (group) => group[0].name === targetName
        )
      : undefined;

  if (targetGroup && targetGroup[0].id !== selected) {
    setSelected(targetGroup[0].id);
  }

  useEffect(() => {
    if (targetName && data) {
      clearNavigationTarget();
    }
  }, [targetName, data]);

  if (!selectedQuery && queries.length > 0) {
    // Select the first query in the sidebar (the group with the most watches)
    setSelected(groupRepeatWatches(queries)[0][0].id);
  }

  const filteredQueries = useMemo(() => {
    if (!searchTerm) {
      return queries;
    }

    const regex = new RegExp(searchTerm, "i");

    return queries.filter((query) => query.name && regex.test(query.name));
  }, [searchTerm, queries]);

  const groups = useMemo(
    () => groupRepeatWatches(filteredQueries),
    [filteredQueries]
  );
  const selectedGroup = useMemo(
    () =>
      groupRepeatWatches(queries).find((group) =>
        group.some((query) => query.id === selected)
      ) ?? [],
    [queries, selected]
  );
  const selectedIndex = selectedGroup.findIndex(
    (query) => query.id === selected
  );

  return (
    <SidebarLayout>
      <SidebarLayout.Sidebar>
        <SearchField
          className="mb-4"
          placeholder="Search queries"
          onChange={setSearchTerm}
          value={searchTerm}
        />
        <List className="h-full">
          {groups.map((group) => {
            const { name, id } = group[0];
            const { networkStatus, pollInterval } = getGroupStatusQuery(group);
            const isSelected = group.some((query) => query.id === selected);

            return (
              <ListItem
                key={`${name}-${id}`}
                onClick={() => {
                  if (!isSelected) {
                    setSelected(id);
                  }
                }}
                selected={isSelected}
                className="font-code"
              >
                <div className="w-full flex items-center justify-between gap-2">
                  <span className="flex-1 overflow-hidden text-ellipsis">
                    {searchTerm && name ? (
                      <HighlightMatch searchTerm={searchTerm} value={name} />
                    ) : (
                      name
                    )}
                  </span>
                  {group.length > 1 && (
                    <Tooltip
                      content={`${group.length} active watches of this query`}
                    >
                      <Badge variant="warning" className="shrink-0">
                        {group.length}
                      </Badge>
                    </Tooltip>
                  )}
                  <QueryStatusIcon
                    networkStatus={networkStatus}
                    pollInterval={pollInterval}
                  />
                </div>
              </ListItem>
            );
          })}
        </List>
      </SidebarLayout.Sidebar>
      {networkStatus === NetworkStatus.loading ? (
        <SidebarLayout.Main>
          <PageSpinner />
        </SidebarLayout.Main>
      ) : (
        <QueryLayout>
          {selectedQuery ? (
            <>
              <QueryLayout.Header>
                <QueryLayout.Title className="flex gap-6 items-center">
                  {selectedQuery.name}
                  {isNetworkRequestInFlight(selectedQuery.networkStatus) &&
                  selectedQuery.networkStatus !== NetworkStatus.poll ? (
                    <>
                      <StatusBadge
                        color="blue"
                        variant="rounded"
                        icon={<Spinner size="xs" />}
                      >
                        {getNetworkStatusLabel(selectedQuery.networkStatus)}
                      </StatusBadge>
                    </>
                  ) : typeof pollInterval === "number" ? (
                    <StatusBadge
                      color={pollInterval === 0 ? "red" : "green"}
                      variant="rounded"
                      icon={
                        selectedQuery.networkStatus === NetworkStatus.poll ? (
                          <Spinner size="xs" />
                        ) : undefined
                      }
                    >
                      {pollInterval === 0 ? (
                        "Stopped polling"
                      ) : (
                        <span>
                          Polling{" "}
                          <span className="text-sm">
                            ({selectedQuery.pollInterval} ms)
                          </span>
                        </span>
                      )}
                    </StatusBadge>
                  ) : null}
                  {selectedGroup.length > 1 && (
                    <div className="flex items-center gap-1 text-sm font-body font-normal">
                      <Button
                        aria-label="Previous watch"
                        size="xs"
                        variant="hidden"
                        icon={<IconChevronLeft />}
                        disabled={selectedIndex <= 0}
                        onClick={() =>
                          setSelected(selectedGroup[selectedIndex - 1].id)
                        }
                      />
                      <span>
                        Watch {selectedIndex + 1} of {selectedGroup.length}
                      </span>
                      <Button
                        aria-label="Next watch"
                        size="xs"
                        variant="hidden"
                        icon={<IconChevronRight />}
                        disabled={selectedIndex >= selectedGroup.length - 1}
                        onClick={() =>
                          setSelected(selectedGroup[selectedIndex + 1].id)
                        }
                      />
                    </div>
                  )}
                </QueryLayout.Title>
                <RunInExplorerButton
                  operation={selectedQuery.queryString}
                  variables={selectedQuery.variables ?? undefined}
                  explorerRef={explorerRef}
                />
              </QueryLayout.Header>
              <QueryLayout.Content>
                {selectedQuery.error && (
                  <AlertDisclosure className="mb-2" variant="error">
                    <AlertDisclosure.Button>
                      Query completed with errors
                    </AlertDisclosure.Button>
                    {selectedQuery.error.__typename ===
                    "SerializedApolloError" ? (
                      <ApolloErrorAlertDisclosurePanel
                        error={selectedQuery.error}
                      />
                    ) : (
                      <SerializedErrorAlertDisclosurePanel
                        error={selectedQuery.error}
                      />
                    )}
                  </AlertDisclosure>
                )}
                <QueryLayout.QueryString code={selectedQuery.queryString} />
              </QueryLayout.Content>
            </>
          ) : (
            <EmptyMessage className="m-auto mt-20" />
          )}
          <QueryLayout.Tabs
            value={currentTab}
            onChange={(value) => setCurrentTab(value)}
          >
            <Tabs.List>
              <Tabs.Trigger value={QueryTabs.Variables}>Variables</Tabs.Trigger>
              <Tabs.Trigger value={QueryTabs.CachedData}>
                Cached Data
              </Tabs.Trigger>
              <Tabs.Trigger value={QueryTabs.Options}>Options</Tabs.Trigger>
              <CopyButton
                className="ml-auto relative right-[6px]"
                size="sm"
                text={copyButtonText}
              />
            </Tabs.List>
            <QueryLayout.TabContent value={QueryTabs.Variables}>
              <VariablesObject variables={selectedQuery?.variables} />
            </QueryLayout.TabContent>
            <QueryLayout.TabContent value={QueryTabs.CachedData}>
              <ObjectViewer value={selectedQuery?.cachedData} />
            </QueryLayout.TabContent>
            <QueryLayout.TabContent value={QueryTabs.Options}>
              <ObjectViewer
                value={selectedQuery?.options}
                displayObjectSize={false}
                collapsed={false}
              />
            </QueryLayout.TabContent>
          </QueryLayout.Tabs>
        </QueryLayout>
      )}
    </SidebarLayout>
  );
};

interface QueryStatusIconProps {
  networkStatus: NetworkStatus;
  pollInterval?: number | null;
}

const NETWORK_STATUS_LABELS: Record<NetworkStatus, string> = {
  [NetworkStatus.loading]: "Loading",
  [NetworkStatus.setVariables]: "Changing variables",
  [NetworkStatus.fetchMore]: "Loading next",
  [NetworkStatus.refetch]: "Refetching",
  [NetworkStatus.poll]: "Polling",
  [NetworkStatus.error]: "Error",
  [NetworkStatus.ready]: "Ready",
  [NetworkStatus.streaming]: "Streaming",
} as const;

function getNetworkStatusLabel(networkStatus: NetworkStatus) {
  return NETWORK_STATUS_LABELS[networkStatus];
}

const QueryStatusIcon = ({
  networkStatus,
  pollInterval,
}: QueryStatusIconProps) => {
  if (isNetworkRequestInFlight(networkStatus)) {
    return <Spinner size="xs" className="shrink-0" />;
  }

  if (networkStatus === NetworkStatus.error) {
    return (
      <IconErrorSolid className="size-4 text-icon-error dark:text-icon-error-dark shrink-0" />
    );
  }

  if (networkStatus === NetworkStatus.ready && pollInterval) {
    return (
      <Tooltip content={`Polling (${pollInterval} ms)`}>
        <span>
          <IconTime className="size-4 shrink-0" />
        </span>
      </Tooltip>
    );
  }

  return null;
};
