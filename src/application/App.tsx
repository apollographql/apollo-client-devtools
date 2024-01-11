import { useEffect, useState } from "react";
import {
  useReactiveVar,
  gql,
  useQuery,
  makeVar,
  TypedDocumentNode,
} from "@apollo/client";

import { currentScreen, Screens } from "./components/Layouts/Navigation";
import { Queries } from "./components/Queries/Queries";
import { Mutations } from "./components/Mutations/Mutations";
import { Explorer } from "./components/Explorer/Explorer";
import { Cache } from "./components/Cache/Cache";
import { GetOperationCounts, GetOperationCountsVariables } from "./types/gql";
import { Tabs } from "./components/Tabs";
import { Button } from "./components/Button";
import { SettingsIcon } from "./components/icons/Settings";
import { SettingsModal } from "./components/Layouts/SettingsModal";
import Logo from "@apollo/brand/logos/symbol.svg";

export const reloadStatus = makeVar<boolean>(false);

const GET_OPERATION_COUNTS: TypedDocumentNode<
  GetOperationCounts,
  GetOperationCountsVariables
> = gql`
  query GetOperationCounts {
    watchedQueries @client {
      count
    }
    mutationLog @client {
      count
    }
  }
`;

export const App = (): JSX.Element => {
  const [open, setOpen] = useState(false);
  const { data } = useQuery(GET_OPERATION_COUNTS);
  const selected = useReactiveVar<Screens>(currentScreen);
  const reloading = useReactiveVar<boolean>(reloadStatus);
  const [embeddedExplorerIFrame, setEmbeddedExplorerIFrame] =
    useState<HTMLIFrameElement | null>(null);

  // During a reload, reset the current screen to Queries.
  useEffect(() => {
    if (reloading && selected !== Screens.Queries) {
      currentScreen(Screens.Queries);
    }
  }, [reloading, selected]);

  if (reloading) {
    return <div></div>;
  }

  return (
    <Tabs
      value={selected}
      onChange={(screen: Screens) => currentScreen(screen)}
      className="flex flex-col bg-primary dark:bg-primary-dark"
    >
      <Tabs.List className="flex items-center px-4">
        <a
          href="https://go.apollo.dev/c/docs"
          target="_blank"
          title="Apollo Client developer documentation"
          className="block pr-4 border-r border-primary dark:border-primary-dark"
          rel="noreferrer"
        >
          <Logo
            width="24"
            height="24"
            fill="currentColor"
            className="text-icon-primary dark:text-icon-primary-dark"
          />
        </a>
        <Tabs.Trigger value={Screens.Explorer}>Explorer</Tabs.Trigger>
        <Tabs.Trigger value={Screens.Queries}>
          Queries ({data?.watchedQueries?.count ?? 0})
        </Tabs.Trigger>
        <Tabs.Trigger value={Screens.Mutations}>
          Mutations ({data?.mutationLog?.count ?? 0})
        </Tabs.Trigger>
        <Tabs.Trigger value={Screens.Cache}>Cache</Tabs.Trigger>
        <div className="flex-1 justify-end">
          <Button
            className="ml-auto peer-[.is-explorer-button]:ml-2"
            size="sm"
            variant="hidden"
            onClick={() => setOpen(true)}
          >
            <SettingsIcon aria-hidden="true" />
            <span className="sr-only">Settings</span>
          </Button>
          <SettingsModal open={open} onOpen={setOpen} />
        </div>
      </Tabs.List>
      {/**
       * We need to keep the iframe inside of the `Explorer` loaded at all times
       * so that we don't reload the iframe when we come to this tab
       */}
      <Tabs.Content value={Screens.Explorer} forceMount>
        <div
          style={{
            display: selected === Screens.Explorer ? undefined : "none",
          }}
        >
          <Explorer
            isVisible={selected === Screens.Explorer}
            navigationProps={{
              queriesCount: data?.watchedQueries?.count ?? 0,
              mutationsCount: data?.mutationLog?.count ?? 0,
            }}
            embeddedExplorerProps={{
              embeddedExplorerIFrame,
              setEmbeddedExplorerIFrame,
            }}
          />
        </div>
      </Tabs.Content>
      <Tabs.Content asChild value={Screens.Queries}>
        <Queries
          navigationProps={{
            queriesCount: data?.watchedQueries?.count ?? 0,
            mutationsCount: data?.mutationLog?.count ?? 0,
          }}
          embeddedExplorerProps={{ embeddedExplorerIFrame }}
        />
      </Tabs.Content>
      <Tabs.Content value={Screens.Mutations}>
        <Mutations
          navigationProps={{
            queriesCount: data?.watchedQueries?.count ?? 0,
            mutationsCount: data?.mutationLog?.count ?? 0,
          }}
          embeddedExplorerProps={{ embeddedExplorerIFrame }}
        />
      </Tabs.Content>
      <Tabs.Content value={Screens.Cache}>
        <Cache
          navigationProps={{
            queriesCount: data?.watchedQueries?.count ?? 0,
            mutationsCount: data?.mutationLog?.count ?? 0,
          }}
        />
      </Tabs.Content>
    </Tabs>
  );
};
