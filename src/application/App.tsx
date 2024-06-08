import { useEffect, useState, useRef } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { useReactiveVar, gql, useQuery, makeVar } from "@apollo/client";

import { currentScreen, Screens } from "./components/Layouts/Navigation";
import { Queries } from "./components/Queries/Queries";
import { Mutations } from "./components/Mutations/Mutations";
import { Explorer } from "./components/Explorer/Explorer";
import { Cache } from "./components/Cache/Cache";
import type { AppQuery, AppQueryVariables } from "./types/gql";
import { Tabs } from "./components/Tabs";
import { Button } from "./components/Button";
import IconSettings from "@apollo/icons/default/IconSettings.svg";
import IconSync from "@apollo/icons/small/IconSync.svg";
import IconGitHubSolid from "@apollo/icons/small/IconGitHubSolid.svg";
import { SettingsModal } from "./components/Layouts/SettingsModal";
import Logo from "@apollo/icons/logos/LogoSymbol.svg";
import type { BannerAlertConfig } from "./components/BannerAlert";
import { BannerAlert } from "./components/BannerAlert";
import type { StateValues as DevtoolsState } from "./machines";
import { ClientNotFoundModal } from "./components/ClientNotFoundModal";
import { getPanelActor } from "../extension/devtools/panelActor";
import { ButtonGroup } from "./components/ButtonGroup";
import {
  GitHubIssueLink,
  LABELS,
  SECTIONS,
} from "./components/GitHubIssueLink";
import { Tooltip } from "./components/Tooltip";
import { Badge } from "./components/Badge";
import { GitHubReleaseHoverCard } from "./components/GitHubReleaseHoverCard";
import { isSnapshotRelease, parseSnapshotRelease } from "./utilities/github";
import { Select } from "./components/Select";
import { Divider } from "./components/Divider";

const panelWindow = getPanelActor(window);

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
          icon={<IconSync />}
          onClick={() => panelWindow.send({ type: "retryConnection" })}
        >
          Retry connection
        </Button>
      </div>
    ),
  },
} satisfies Record<DevtoolsState, BannerAlertConfig>;

const APP_QUERY: TypedDocumentNode<AppQuery, AppQueryVariables> = gql`
  query AppQuery {
    clientVersion @client
    watchedQueries @client {
      count
    }
    mutationLog @client {
      count
    }
    clients {
      id
      version
    }
  }
`;

const ISSUE_BODY = `
${SECTIONS.defaultDescription}
${SECTIONS.reproduction}
${SECTIONS.apolloClientVersion}
${SECTIONS.devtoolsVersion}
`;

export const App = () => {
  const mountedRef = useRef(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data } = useQuery(APP_QUERY);
  const [clientNotFoundModalOpen, setClientNotFoundModalOpen] = useState(false);
  const selected = useReactiveVar<Screens>(currentScreen);
  const state = useReactiveVar(devtoolsState);
  const [embeddedExplorerIFrame, setEmbeddedExplorerIFrame] =
    useState<HTMLIFrameElement | null>(null);

  const clientVersion = data?.clientVersion;
  const clients = data?.clients ?? [];

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
      setClientNotFoundModalOpen(false);
      timeout = setTimeout(dismiss, 2500);
    }

    mountedRef.current = true;

    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <>
      <SettingsModal open={settingsOpen} onOpen={setSettingsOpen} />
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
        <div className="flex items-center border-b border-b-primary dark:border-b-primary-dark gap-4 px-4">
          <a
            href="https://go.apollo.dev/c/docs"
            target="_blank"
            title="Apollo Client developer documentation"
            className="block"
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
          <Divider orientation="vertical" />
          <Tabs.List className="-mb-px">
            <Tabs.Trigger value={Screens.Queries}>
              Queries ({data?.watchedQueries?.count ?? 0})
            </Tabs.Trigger>
            <Tabs.Trigger value={Screens.Mutations}>
              Mutations ({data?.mutationLog?.count ?? 0})
            </Tabs.Trigger>
            <Tabs.Trigger value={Screens.Cache}>Cache</Tabs.Trigger>
            <Tabs.Trigger value={Screens.Explorer}>Explorer</Tabs.Trigger>
          </Tabs.List>
          <div className="ml-auto flex-1 justify-end flex items-center gap-2 h-full">
            {clientVersion && (
              <GitHubReleaseHoverCard version={clientVersion}>
                <a
                  className="no-underline"
                  href={
                    isSnapshotRelease(clientVersion)
                      ? `https://github.com/apollographql/apollo-client/pull/${parseSnapshotRelease(clientVersion).prNumber}`
                      : `https://github.com/apollographql/apollo-client/releases/tag/v${clientVersion}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <Badge variant="info" className="cursor-pointer">
                    Apollo Client <span className="lowercase">v</span>
                    {clientVersion}
                  </Badge>
                </a>
              </GitHubReleaseHoverCard>
            )}
            {clients.length > 1 && (
              <Select size="sm" className="w-44">
                {clients.map((client, index) => (
                  <Select.Option key={client.id} value={client.id}>
                    Apollo Client {index}
                  </Select.Option>
                ))}
              </Select>
            )}
            <Divider orientation="vertical" className="mx-2" />
            <ButtonGroup>
              <Tooltip content="Report an issue">
                <Button
                  aria-label="Report an issue"
                  variant="hidden"
                  size="sm"
                  icon={<IconGitHubSolid />}
                  asChild
                >
                  <GitHubIssueLink labels={[LABELS.bug]} body={ISSUE_BODY} />
                </Button>
              </Tooltip>

              <Tooltip content="Settings">
                <Button
                  aria-label="Settings"
                  size="sm"
                  variant="hidden"
                  onClick={() => setSettingsOpen(true)}
                  icon={<IconSettings />}
                />
              </Tooltip>
            </ButtonGroup>
          </div>
        </div>
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
