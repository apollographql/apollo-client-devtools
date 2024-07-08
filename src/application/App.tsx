import { useEffect, useState, useRef } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import {
  useReactiveVar,
  gql,
  useQuery,
  makeVar,
  useSuspenseQuery,
  useApolloClient,
} from "@apollo/client";
import { useMachine } from "@xstate/react";

import { currentScreen, Screens } from "./components/Layouts/Navigation";
import { Queries } from "./components/Queries/Queries";
import { Mutations } from "./components/Mutations/Mutations";
import { Explorer } from "./components/Explorer/Explorer";
import { Cache } from "./components/Cache/Cache";
import type { ClientQuery, ClientQueryVariables } from "./types/gql";
import { type AppQuery, type AppQueryVariables } from "./types/gql";
import { Tabs } from "./components/Tabs";
import { Button } from "./components/Button";
import IconSettings from "@apollo/icons/default/IconSettings.svg";
import IconSync from "@apollo/icons/small/IconSync.svg";
import IconGitHubSolid from "@apollo/icons/small/IconGitHubSolid.svg";
import { SettingsModal } from "./components/Layouts/SettingsModal";
import Logo from "@apollo/icons/logos/LogoSymbol.svg";
import type { BannerAlertConfig } from "./components/BannerAlert";
import { BannerAlert } from "./components/BannerAlert";
import type { StateValues } from "./machines";
import { devtoolsMachine, type StateValues as DevtoolsState } from "./machines";
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
import { useActorEvent } from "./hooks/useActorEvent";
import { addClient, removeClient } from ".";

const panelWindow = getPanelActor(window);

export const devtoolsState = makeVar<StateValues>("initialized");

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
    clients {
      id
    }
  }
`;

const CLIENT_QUERY: TypedDocumentNode<ClientQuery, ClientQueryVariables> = gql`
  query ClientQuery($id: ID!) {
    client(id: $id) {
      id
      version
      queries {
        total
      }
      mutations {
        total
      }
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
  const apolloClient = useApolloClient();
  const [snapshot, send] = useMachine(
    devtoolsMachine.provide({
      actions: {
        connectToClient: ({ self }) => {
          if (self.getSnapshot().matches("initialized")) {
            BannerAlert.show(ALERT_CONFIGS.initialized);
          }

          getPanelActor(window).send({ type: "connectToClient" });
        },
        notifyConnected: () => {
          const dismiss = BannerAlert.show(ALERT_CONFIGS.connected);
          setTimeout(dismiss, 2500);
          setClientNotFoundModalOpen(false);
        },
      },
    })
  );

  useActorEvent("connectToDevtools", () => {
    send({ type: "connect" });
  });

  useActorEvent("registerClient", (message) => {
    send({ type: "connect" });
    addClient(message.payload);
  });

  useActorEvent("clientTerminated", (message) => {
    send({ type: "disconnect" });
    removeClient(message.clientId);
  });

  useActorEvent("disconnectFromDevtools", () => {
    send({ type: "disconnect" });
  });

  useEffect(() => {
    if (snapshot.value !== "connected") {
      apolloClient.resetStore();
    }
  }, [apolloClient, snapshot.value]);

  const mountedRef = useRef(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data } = useSuspenseQuery(APP_QUERY);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(
    data.clients[0]?.id
  );
  const [clientNotFoundModalOpen, setClientNotFoundModalOpen] = useState(false);
  const selected = useReactiveVar<Screens>(currentScreen);
  const [embeddedExplorerIFrame, setEmbeddedExplorerIFrame] =
    useState<HTMLIFrameElement | null>(null);

  const { data: clientData } = useQuery(CLIENT_QUERY, {
    variables: { id: selectedClientId as string },
    skip: !selectedClientId,
    pollInterval: 1000,
  });

  const client = clientData?.client;
  const clientVersion = clientData?.client.version;
  const clients = data?.clients ?? [];
  const clientIds = clients.map((c) => c.id);

  if (
    (selectedClientId && !clientIds.includes(selectedClientId)) ||
    (!selectedClientId && clientIds.length > 0)
  ) {
    setSelectedClientId(clientIds[0]);
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    // Don't show connected message on the first render if we are already
    // connected to the client.
    if (!mountedRef.current && snapshot.value === "connected") {
      return;
    }

    if (snapshot.value === "notFound") {
      setClientNotFoundModalOpen(true);
    }

    const dismiss = BannerAlert.show(
      ALERT_CONFIGS[snapshot.value as DevtoolsState]
    );

    if (snapshot.value === "connected") {
      setClientNotFoundModalOpen(false);
      timeout = setTimeout(dismiss, 2500);
    }

    mountedRef.current = true;

    return () => clearTimeout(timeout);
  }, [snapshot.value]);

  return (
    <>
      <SettingsModal open={settingsOpen} onOpen={setSettingsOpen} />
      <ClientNotFoundModal
        open={clientNotFoundModalOpen}
        onClose={() => setClientNotFoundModalOpen(false)}
        onRetry={() => {
          send({ type: "retry" });
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
              Queries ({client?.queries.total ?? 0})
            </Tabs.Trigger>
            <Tabs.Trigger value={Screens.Mutations}>
              Mutations ({client?.mutations.total ?? 0})
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
              <Select
                size="sm"
                className="w-44"
                value={selectedClientId}
                onValueChange={setSelectedClientId}
              >
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
          <Queries
            clientId={selectedClientId}
            explorerIFrame={embeddedExplorerIFrame}
          />
        </Tabs.Content>
        <Tabs.Content
          className="flex-1 overflow-hidden"
          value={Screens.Mutations}
        >
          <Mutations
            clientId={selectedClientId}
            explorerIFrame={embeddedExplorerIFrame}
          />
        </Tabs.Content>
        <Tabs.Content className="flex-1 overflow-hidden" value={Screens.Cache}>
          <Cache clientId={selectedClientId} />
        </Tabs.Content>
      </Tabs>
    </>
  );
};
