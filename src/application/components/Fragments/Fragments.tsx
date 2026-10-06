import { useEffect, useMemo, useState } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import IconChevronLeft from "@apollo/icons/default/IconChevronLeft.svg";
import IconChevronRight from "@apollo/icons/default/IconChevronRight.svg";
import type {
  GetFragmentWatchData,
  GetFragmentWatchDataVariables,
  GetFragmentWatches,
  GetFragmentWatchesVariables,
} from "../../types/gql";
import { useActorEvent } from "../../hooks/useActorEvent";
import { isIgnoredError } from "../../utilities/ignoredErrors";
import { useIsExtensionInvalidated } from "@/application/machines/devtoolsMachine";
import { SidebarLayout } from "../Layouts/SidebarLayout";
import { SearchField } from "../SearchField";
import { List } from "../List";
import { ListItem } from "../ListItem";
import HighlightMatch from "../HighlightMatch";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { QueryLayout } from "../QueryLayout";
import { Tabs } from "../Tabs";
import { CopyButton } from "../CopyButton";
import { EmptyMessage } from "../EmptyMessage";
import { PageSpinner } from "../PageSpinner";
import { ObjectViewer } from "../ObjectViewer";
import {
  Screens,
  clearNavigationTarget,
  useNavigationTarget,
} from "../Layouts/Navigation";

enum FragmentTabs {
  Entities = "Entities",
  CachedData = "CachedData",
}

const GET_FRAGMENT_WATCHES: TypedDocumentNode<
  GetFragmentWatches,
  GetFragmentWatchesVariables
> = gql`
  query GetFragmentWatches($id: ID!) {
    client(id: $id) {
      id
      fragmentWatches {
        items {
          name
          fragmentString
          count
          entities {
            id
            variables
          }
        }
      }
    }
  }
`;

const GET_FRAGMENT_WATCH_DATA: TypedDocumentNode<
  GetFragmentWatchData,
  GetFragmentWatchDataVariables
> = gql`
  query GetFragmentWatchData(
    $id: ID!
    $fragmentName: String!
    $entityId: String
    $variables: Variables
  ) {
    client(id: $id) {
      id
      fragmentWatchData(
        fragmentName: $fragmentName
        entityId: $entityId
        variables: $variables
      ) {
        cachedData
        complete
      }
    }
  }
`;

type FragmentWatch = NonNullable<
  GetFragmentWatches["client"]
>["fragmentWatches"]["items"][number];
type Entity = FragmentWatch["entities"][number];

const STABLE_EMPTY_FRAGMENT_WATCHES: FragmentWatch[] = [];

function getEntityKey(entity: Entity) {
  return `${entity.id}:${JSON.stringify(entity.variables ?? {})}`;
}

interface FragmentsProps {
  clientId: string | undefined;
}

export function Fragments({ clientId }: FragmentsProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedEntityKey, setSelectedEntityKey] = useState<string | null>(
    null
  );
  const [currentTab, setCurrentTab] = useState(FragmentTabs.Entities);
  const [searchTerm, setSearchTerm] = useState("");
  const isExtensionInvalidated = useIsExtensionInvalidated();
  const { data, loading, error, startPolling, stopPolling } = useQuery(
    GET_FRAGMENT_WATCHES,
    {
      variables: { id: clientId as string },
      skip: clientId == null,
      pollInterval: isExtensionInvalidated ? 0 : 500,
      fetchPolicy: isExtensionInvalidated ? "cache-only" : "cache-first",
    }
  );

  if (error && !isIgnoredError(error)) {
    throw error;
  }

  // Sorted by number of watches (desc) by the devtools hook
  const fragmentWatches =
    data?.client?.fragmentWatches.items ?? STABLE_EMPTY_FRAGMENT_WATCHES;
  const selectedFragment =
    fragmentWatches.find(({ name }) => name === selected) ?? fragmentWatches[0];
  const entities = selectedFragment?.entities ?? [];
  const selectedEntityIndex = Math.max(
    0,
    entities.findIndex((entity) => getEntityKey(entity) === selectedEntityKey)
  );
  const selectedEntity = entities[selectedEntityIndex];

  // Only read cached data for the selected entity, and only while it's shown,
  // since each read diffs the fragment against the cache
  const {
    data: watchData,
    startPolling: startPollingWatchData,
    stopPolling: stopPollingWatchData,
  } = useQuery(GET_FRAGMENT_WATCH_DATA, {
    variables: {
      id: clientId as string,
      fragmentName: selectedFragment?.name ?? "",
      entityId: selectedEntity?.id,
      variables: selectedEntity?.variables,
    },
    skip:
      clientId == null ||
      !selectedFragment ||
      !selectedEntity ||
      currentTab !== FragmentTabs.CachedData,
    pollInterval: isExtensionInvalidated ? 0 : 500,
    fetchPolicy: isExtensionInvalidated ? "cache-only" : "cache-first",
  });

  useActorEvent("panelHidden", () => {
    stopPolling();
    stopPollingWatchData();
  });
  useActorEvent("panelShown", () => {
    startPolling(500);
    startPollingWatchData(500);
  });

  // Opened from another tab (e.g. Performance) with a fragment to select
  const targetName = useNavigationTarget(Screens.Fragments);

  if (
    targetName &&
    targetName !== selected &&
    fragmentWatches.some(({ name }) => name === targetName)
  ) {
    setSelected(targetName);
    setSelectedEntityKey(null);
  }

  useEffect(() => {
    if (targetName && data) {
      clearNavigationTarget();
    }
  }, [targetName, data]);

  const filteredFragmentWatches = useMemo(() => {
    if (!searchTerm) {
      return fragmentWatches;
    }

    const regex = new RegExp(searchTerm, "i");

    return fragmentWatches.filter(({ name }) => regex.test(name));
  }, [searchTerm, fragmentWatches]);

  if (loading && !data) {
    return <PageSpinner />;
  }

  const fragmentWatchData = watchData?.client?.fragmentWatchData;
  const copyButtonText = JSON.stringify(
    currentTab === FragmentTabs.CachedData
      ? fragmentWatchData?.cachedData ?? {}
      : entities
  );
  // Fragment variables are rare, so only show them when used
  const hasVariables = entities.some(({ variables }) => variables);

  function selectEntity(index: number) {
    const entity = entities[index];

    if (entity) {
      setSelectedEntityKey(getEntityKey(entity));
    }
  }

  return (
    <SidebarLayout>
      <SidebarLayout.Sidebar>
        <SearchField
          className="mb-4"
          placeholder="Search fragments"
          onChange={setSearchTerm}
          value={searchTerm}
        />
        <List className="h-full">
          {filteredFragmentWatches.map(({ name, count }) => (
            <ListItem
              key={name}
              onClick={() => {
                if (name !== selectedFragment?.name) {
                  setSelected(name);
                  setSelectedEntityKey(null);
                }
              }}
              selected={selectedFragment?.name === name}
              className="font-code"
            >
              <div className="w-full flex items-center justify-between gap-2">
                <span className="flex-1 overflow-hidden text-ellipsis">
                  {searchTerm ? (
                    <HighlightMatch searchTerm={searchTerm} value={name} />
                  ) : (
                    name
                  )}
                </span>
                <Badge variant="neutral" className="shrink-0">
                  {count}
                </Badge>
              </div>
            </ListItem>
          ))}
        </List>
      </SidebarLayout.Sidebar>
      <QueryLayout>
        {selectedFragment ? (
          <>
            <QueryLayout.Header>
              <QueryLayout.Title className="flex gap-6 items-center">
                {selectedFragment.name}
                <span className="text-sm font-body font-normal text-secondary dark:text-secondary-dark">
                  {selectedFragment.count} watches
                </span>
              </QueryLayout.Title>
            </QueryLayout.Header>
            <QueryLayout.Content>
              <QueryLayout.QueryString code={selectedFragment.fragmentString} />
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
            <Tabs.Trigger value={FragmentTabs.Entities}>Entities</Tabs.Trigger>
            <Tabs.Trigger value={FragmentTabs.CachedData}>
              Cached Data
            </Tabs.Trigger>
            {selectedEntity && (
              <div className="ml-auto flex items-center gap-1 text-sm font-code">
                <Button
                  aria-label="Previous entity"
                  size="xs"
                  variant="hidden"
                  icon={<IconChevronLeft />}
                  disabled={selectedEntityIndex <= 0}
                  onClick={() => selectEntity(selectedEntityIndex - 1)}
                />
                <span className="whitespace-nowrap">
                  {selectedEntity.id ?? "(unidentified)"} (
                  {selectedEntityIndex + 1} of {entities.length})
                </span>
                <Button
                  aria-label="Next entity"
                  size="xs"
                  variant="hidden"
                  icon={<IconChevronRight />}
                  disabled={selectedEntityIndex >= entities.length - 1}
                  onClick={() => selectEntity(selectedEntityIndex + 1)}
                />
              </div>
            )}
            <CopyButton
              className={
                selectedEntity
                  ? "relative right-[6px]"
                  : "ml-auto relative right-[6px]"
              }
              size="sm"
              text={copyButtonText}
            />
          </Tabs.List>
          <QueryLayout.TabContent value={FragmentTabs.Entities}>
            <table className="w-full text-left font-code text-sm">
              <thead className="text-secondary dark:text-secondary-dark">
                <tr>
                  <th className="font-normal py-1">Entity</th>
                  {hasVariables && (
                    <th className="font-normal py-1">Variables</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {entities.map((entity, index) => (
                  <tr
                    key={getEntityKey(entity)}
                    className={`border-t border-primary dark:border-primary-dark cursor-pointer ${
                      index === selectedEntityIndex
                        ? "bg-neutral dark:bg-neutral-dark"
                        : "hover:bg-button-secondaryHover hover:dark:bg-button-secondaryHover-dark"
                    }`}
                    onClick={() => {
                      selectEntity(index);
                      setCurrentTab(FragmentTabs.CachedData);
                    }}
                  >
                    <td className="py-1">{entity.id ?? "(unidentified)"}</td>
                    {hasVariables && (
                      <td className="py-1 text-secondary dark:text-secondary-dark">
                        {entity.variables
                          ? JSON.stringify(entity.variables)
                          : ""}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </QueryLayout.TabContent>
          <QueryLayout.TabContent value={FragmentTabs.CachedData}>
            {fragmentWatchData && !fragmentWatchData.complete && (
              <p className="text-sm text-secondary dark:text-secondary-dark mb-2">
                Some fields are missing from the cache (partial data)
              </p>
            )}
            <ObjectViewer value={fragmentWatchData?.cachedData} />
          </QueryLayout.TabContent>
        </QueryLayout.Tabs>
      </QueryLayout>
    </SidebarLayout>
  );
}
