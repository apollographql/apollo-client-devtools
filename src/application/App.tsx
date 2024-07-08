import { useEffect, useState } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import {
  useReactiveVar,
  gql,
  useQuery,
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
import { BannerAlert } from "./components/BannerAlert";
import { devtoolsMachine } from "./machines";
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
        connectToClient: () => {
          BannerAlert.show({
            type: "loading",
            content: "Looking for client...",
          });

          getPanelActor(window).send({ type: "connectToClient" });
        },
        notifyNotFound: () => {
          setClientNotFoundModalOpen(true);

          BannerAlert.show({
            type: "error",
            content: (
              <div className="flex justify-between items-center">
                Client not found{" "}
                <Button
                  size="xs"
                  variant="hidden"
                  icon={<IconSync />}
                  onClick={() => send({ type: "retry" })}
                >
                  Retry connection
                </Button>
              </div>
            ),
          });
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
    // Disconnect if we are terminating the last client. We assume that 1 client
    // means we are terminating the selected client
    if (clients.length === 1) {
      send({ type: "disconnect" });
    }

    removeClient(message.clientId);
  });

  useActorEvent("disconnectFromDevtools", () => {
    send({ type: "disconnect" });
  });

  useEffect(() => {
    if (snapshot.value === "connected") {
      setClientNotFoundModalOpen(false);
    } else {
      apolloClient.resetStore();
    }
  }, [apolloClient, snapshot.value]);

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
  const clients = data?.clients ?? [];
  const clientIds = clients.map((c) => c.id);

  if (
    (selectedClientId && !clientIds.includes(selectedClientId)) ||
    (!selectedClientId && clientIds.length > 0)
  ) {
    setSelectedClientId(clientIds[0]);
  }

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
            {client?.version && (
              <GitHubReleaseHoverCard version={client.version}>
                <a
                  className="no-underline"
                  href={
                    isSnapshotRelease(client.version)
                      ? `https://github.com/apollographql/apollo-client/pull/${parseSnapshotRelease(client.version).prNumber}`
                      : `https://github.com/apollographql/apollo-client/releases/tag/v${client.version}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <Badge variant="info" className="cursor-pointer">
                    Apollo Client <span className="lowercase">v</span>
                    {client.version}
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
