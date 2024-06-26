import type { ReactNode } from "react";
import { useState } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { NetworkStatus, gql, useQuery } from "@apollo/client";
import { isNetworkRequestInFlight } from "@apollo/client/core/networkStatus";
import { List } from "../List";
import { ListItem } from "../ListItem";
import IconErrorSolid from "@apollo/icons/default/IconErrorSolid.svg";
import IconTime from "@apollo/icons/default/IconTime.svg";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "./RunInExplorerButton";
import type {
  GetWatchedQueries,
  GetWatchedQueriesVariables,
} from "../../types/gql";
import { Tabs } from "../Tabs";
import { JSONTreeViewer } from "../JSONTreeViewer";
import { QueryLayout } from "../QueryLayout";
import { CopyButton } from "../CopyButton";
import { EmptyMessage } from "../EmptyMessage";
import { isEmpty } from "../../utilities/isEmpty";
import { Spinner } from "../Spinner";
import { StatusBadge } from "../StatusBadge";
import { AlertDisclosure } from "../AlertDisclosure";
import { Tooltip } from "../Tooltip";

enum QueryTabs {
  Variables = "Variables",
  CachedData = "CachedData",
  Options = "Options",
}

const GET_WATCHED_QUERIES: TypedDocumentNode<
  GetWatchedQueries,
  GetWatchedQueriesVariables
> = gql`
  query GetWatchedQueries {
    watchedQueries @client {
      queries {
        id
        name
        queryString
        variables
        cachedData
        options
        networkStatus
        pollInterval
        error {
          networkError {
            message
            name
            stack
          }
          clientErrors
          graphQLErrors {
            message
            path
            extensions
          }
          protocolErrors
        }
      }
    }
  }
`;

interface QueriesProps {
  explorerIFrame: HTMLIFrameElement | null;
}

export const Queries = ({ explorerIFrame }: QueriesProps) => {
  const [selected, setSelected] = useState<number>(0);
  const { data } = useQuery(GET_WATCHED_QUERIES, { returnPartialData: true });

  const queries = data?.watchedQueries.queries ?? [];
  const selectedQuery = queries.find((query) => query.id === selected);
  const [currentTab, setCurrentTab] = useState<QueryTabs>(QueryTabs.Variables);
  const copyButtonText = JSON.stringify(
    currentTab === QueryTabs.Variables
      ? selectedQuery?.variables ?? {}
      : selectedQuery?.cachedData ?? {}
  );

  const networkError = selectedQuery?.error?.networkError;
  const pollInterval = selectedQuery?.pollInterval;

  return (
    <SidebarLayout>
      <SidebarLayout.Sidebar>
        <List className="h-full">
          {queries.map(({ name, id, networkStatus, pollInterval }) => {
            return (
              <ListItem
                key={`${name}-${id}`}
                onClick={() => setSelected(id)}
                selected={selected === id}
                className="font-code"
              >
                <div className="w-full flex items-center justify-between">
                  {name}
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
                          ({selectedQuery.pollInterval}ms)
                        </span>
                      </span>
                    )}
                  </StatusBadge>
                ) : null}
              </QueryLayout.Title>
              <RunInExplorerButton
                operation={selectedQuery.queryString}
                variables={selectedQuery.variables ?? undefined}
                embeddedExplorerIFrame={explorerIFrame}
              />
            </QueryLayout.Header>
            <QueryLayout.Content>
              {selectedQuery.error && (
                <AlertDisclosure className="mb-2" variant="error">
                  <AlertDisclosure.Button>
                    Query completed with errors
                  </AlertDisclosure.Button>
                  <AlertDisclosure.Panel>
                    <ul className="flex flex-col gap-4">
                      {networkError && (
                        <ErrorMessageAlertItem>
                          <div>
                            [Network]: {networkError.name}:{" "}
                            {networkError.message}
                          </div>
                          {networkError.stack && (
                            <div className="mt-3">
                              <JSONTreeViewer
                                key={selectedQuery.id}
                                className="text-xs"
                                data={networkError.stack.split("\n").slice(1)}
                                keyPath={["Stack trace"]}
                                theme="alertError"
                                shouldExpandNodeInitially={() => false}
                              />
                            </div>
                          )}
                        </ErrorMessageAlertItem>
                      )}
                      {selectedQuery.error.graphQLErrors.map(
                        (graphQLError, idx) => (
                          <ErrorMessageAlertItem key={`gql-${idx}`}>
                            <div>[GraphQL]: {graphQLError.message}</div>
                            {graphQLError.path && (
                              <div className="text-xs mt-3">
                                path: [
                                {graphQLError.path.map((segment, idx, arr) => {
                                  return (
                                    <>
                                      {typeof segment === "number"
                                        ? segment
                                        : `"${segment}"`}
                                      {idx !== arr.length - 1 && ", "}
                                    </>
                                  );
                                })}
                                ]
                              </div>
                            )}
                            {graphQLError.extensions && (
                              <JSONTreeViewer
                                key={selectedQuery.id}
                                className="mt-4 text-xs"
                                data={graphQLError.extensions}
                                keyPath={["extensions"]}
                                theme="alertError"
                              />
                            )}
                          </ErrorMessageAlertItem>
                        )
                      )}
                      {selectedQuery.error.protocolErrors.map(
                        (message, idx) => (
                          <ErrorMessageAlertItem key={`protocol-${idx}`}>
                            [Protocol]: {message}
                          </ErrorMessageAlertItem>
                        )
                      )}
                      {selectedQuery.error.clientErrors.map((message, idx) => (
                        <ErrorMessageAlertItem key={`client-${idx}`}>
                          [Client]: {message}
                        </ErrorMessageAlertItem>
                      ))}
                    </ul>
                  </AlertDisclosure.Panel>
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
            <JSONTreeViewer
              hideRoot={!isEmpty(selectedQuery?.variables)}
              className="[&>li]:!pt-0"
              data={selectedQuery?.variables ?? {}}
            />
          </QueryLayout.TabContent>
          <QueryLayout.TabContent value={QueryTabs.CachedData}>
            <JSONTreeViewer
              hideRoot={!isEmpty(selectedQuery?.cachedData)}
              className="[&>li]:!pt-0"
              data={selectedQuery?.cachedData ?? {}}
            />
          </QueryLayout.TabContent>
          <QueryLayout.TabContent value={QueryTabs.Options}>
            <JSONTreeViewer
              hideRoot={!isEmpty(selectedQuery?.options)}
              className="[&>li]:!pt-0"
              data={selectedQuery?.options ?? {}}
            />
          </QueryLayout.TabContent>
        </QueryLayout.Tabs>
      </QueryLayout>
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
} as const;

function getNetworkStatusLabel(networkStatus: NetworkStatus) {
  return NETWORK_STATUS_LABELS[networkStatus];
}

const QueryStatusIcon = ({
  networkStatus,
  pollInterval,
}: QueryStatusIconProps) => {
  if (isNetworkRequestInFlight(networkStatus)) {
    return <Spinner size="xs" />;
  }

  if (networkStatus === NetworkStatus.error) {
    return (
      <IconErrorSolid className="size-4 text-icon-error dark:text-icon-error-dark" />
    );
  }

  if (networkStatus === NetworkStatus.ready && pollInterval) {
    return (
      <Tooltip content={`Polling (${pollInterval}ms)`}>
        <span>
          <IconTime className="size-4" />
        </span>
      </Tooltip>
    );
  }

  return null;
};

const ErrorMessageAlertItem = ({ children }: { children: ReactNode }) => {
  return (
    <li className="border-l-2 border-l-warning dark:border-l-warning-dark px-4 font-code text-sm font-normal text-error dark:text-error-dark">
      {children}
    </li>
  );
};
