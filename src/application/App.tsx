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

export const App = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
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
      className="flex flex-col h-screen bg-primary dark:bg-primary-dark"
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
            role="img"
            width="24"
            height="24"
            fill="currentColor"
            className="text-icon-primary dark:text-icon-primary-dark"
          />
        </a>
        <Tabs.Trigger value={Screens.Queries}>
          Queries ({data?.watchedQueries?.count ?? 0})
        </Tabs.Trigger>
        <Tabs.Trigger value={Screens.Mutations}>
          Mutations ({data?.mutationLog?.count ?? 0})
        </Tabs.Trigger>
        <Tabs.Trigger value={Screens.Cache}>Cache</Tabs.Trigger>
        <Tabs.Trigger value={Screens.Explorer}>Explorer</Tabs.Trigger>

        <div className="flex-1 justify-end">
          <Button
            className="ml-auto peer-[.is-explorer-button]:ml-2"
            size="sm"
            variant="hidden"
            onClick={() => setSettingsOpen(true)}
          >
            <SettingsIcon aria-hidden="true" />
            <span className="sr-only">Settings</span>
          </Button>
          <SettingsModal open={settingsOpen} onOpen={setSettingsOpen} />
        </div>
      </Tabs.List>
      {/**
       * We need to keep the iframe inside of the `Explorer` loaded at all times
       * so that we don't reload the iframe when we come to this tab
       */}
      <Tabs.Content
        className="flex flex-col flex-1"
        value={Screens.Explorer}
        forceMount
      >
        <Explorer
          isVisible={selected === Screens.Explorer}
          embeddedExplorerProps={{
            embeddedExplorerIFrame,
            setEmbeddedExplorerIFrame,
          }}
        />
      </Tabs.Content>
      <Tabs.Content className="flex-1 overflow-hidden" value={Screens.Queries}>
        <Queries explorerIFrame={embeddedExplorerIFrame} />
      </Tabs.Content>
      <Tabs.Content
        className="flex-1 overflow-hidden"
        value={Screens.Mutations}
      >
        <Mutations explorerIFrame={embeddedExplorerIFrame} />
      </Tabs.Content>
      <Tabs.Content className="flex-1 overflow-hidden" value={Screens.Cache}>
        <Cache />
      </Tabs.Content>
    </Tabs>
  );
};
