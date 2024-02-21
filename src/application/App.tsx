import { useEffect, useState, useRef } from "react";
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
import IconSettings from "@apollo/icons/default/IconSettings.svg";
import IconSync from "@apollo/icons/small/IconSync.svg";
import { SettingsModal } from "./components/Layouts/SettingsModal";
import Logo from "@apollo/icons/logos/LogoSymbol.svg";
import { BannerAlert, BannerAlertConfig } from "./components/BannerAlert";
import { GetStates } from "./stateMachine";
import { DevtoolsMachine } from "./machines";
import { ClientNotFoundModal } from "./components/ClientNotFoundModal";
import { getPanelActor } from "../extension/devtools/panelActor";

const panelWindow = getPanelActor(window);

type DevtoolsState = GetStates<DevtoolsMachine>;

export const devtoolsState = makeVar<DevtoolsState>("initialized");

const ALERT_CONFIGS = {
  initialized: {
    type: "loading",
    content: "Looking for client...",
  },
  retrying: {
    type: "loading",
    content: "Looking for client...",
  },
  connected: {
    type: "success",
    content: "Connected!",
  },
  disconnected: {
    type: "loading",
    content: "Disconnected. Looking for client...",
  },
  timedout: {
    type: "error",
    content:
      "Unable to communicate with browser tab. Please reload the window and restart the devtools to try again.",
  },
  notFound: {
    type: "error",
    content: (
      <div className="flex justify-between items-center">
        Client not found{" "}
        <Button
          size="xs"
          variant="hidden"
          icon={IconSync}
          onClick={() => panelWindow.send({ type: "retryConnection" })}
        >
          Retry connection
        </Button>
      </div>
    ),
  },
} satisfies Record<DevtoolsState, BannerAlertConfig>;

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
  const mountedRef = useRef(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data } = useQuery(GET_OPERATION_COUNTS);
  const [clientNotFoundModalOpen, setClientNotFoundModalOpen] = useState(false);
  const selected = useReactiveVar<Screens>(currentScreen);
  const state = useReactiveVar(devtoolsState);
  const [embeddedExplorerIFrame, setEmbeddedExplorerIFrame] =
    useState<HTMLIFrameElement | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    // Don't show connected message on the first render if we are already
    // connected to the client.
    if (!mountedRef.current && state === "connected") {
      return;
    }

    if (state === "notFound") {
      setClientNotFoundModalOpen(true);
    }

    const dismiss = BannerAlert.show(ALERT_CONFIGS[state]);

    if (state === "connected") {
      timeout = setTimeout(dismiss, 2500);
    }

    mountedRef.current = true;

    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <>
      <ClientNotFoundModal
        open={clientNotFoundModalOpen}
        onClose={() => setClientNotFoundModalOpen(false)}
        onRetry={() => {
          panelWindow.send({ type: "retryConnection" });
          setClientNotFoundModalOpen(false);
        }}
      />
      <BannerAlert />
      <Tabs
        value={selected}
        onChange={(screen) => currentScreen(screen)}
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
              <IconSettings aria-hidden="true" className="w-4" />
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
        <Tabs.Content
          className="flex-1 overflow-hidden"
          value={Screens.Queries}
        >
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
    </>
  );
};
