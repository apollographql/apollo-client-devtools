import React, { useEffect, useState } from "react";
import { useReactiveVar, gql, useQuery, makeVar } from "@apollo/client";

import { currentScreen, Screens } from "./components/Layouts/Navigation";
import { Queries } from "./components/Queries/Queries";
import { Mutations } from "./components/Mutations/Mutations";
import { Explorer } from "./components/Explorer/Explorer";
import { Cache } from "./components/Cache/Cache";
import { clients, currentClient } from ".";

export const reloadStatus = makeVar<boolean>(false);

const screens = {
  [Screens.Explorer]: Explorer,
  [Screens.Queries]: Queries,
  [Screens.Mutations]: Mutations,
  [Screens.Cache]: Cache,
};

export const GET_OPERATION_COUNTS = gql`
  query GetOperationCounts($clientId: ID!) {
    client(id: $id) @client {
      watchedQueries {
        queries {
          id
        }
        count
      }
      mutationLog {
        count
      }
    }
  }
`;

export const App = (): JSX.Element => {
  const selectedClient = useReactiveVar(currentClient)
  const allClients = useReactiveVar(clients);

  if (allClients.length > 0 && !selectedClient) {
    currentClient(allClients[0])
  }

  const { data } = useQuery(GET_OPERATION_COUNTS, {
    variables: {
      id: selectedClient
    },
  });
  const selected = useReactiveVar<Screens>(currentScreen);
  const reloading = useReactiveVar<boolean>(reloadStatus);
  const [embeddedExplorerIFrame, setEmbeddedExplorerIFrame] = useState<HTMLIFrameElement | null>(null);

  const Screen = screens[selected];

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
    <>
      {selected !== Screens.Explorer && (
        <Screen
          isVisible={undefined}
          navigationProps={{
            queriesCount: data?.client?.watchedQueries?.count,
            mutationsCount: data?.client?.mutationLog?.count,
          }}
          embeddedExplorerProps={{
            embeddedExplorerIFrame,
            setEmbeddedExplorerIFrame,
          }}
        />
      )}
      {/**
       * We need to keep the iframe inside of the `Explorer` loaded at all times
       * so that we don't reload the iframe when we come to this tab
       */}
      <Explorer
        isVisible={selected === Screens.Explorer}
        navigationProps={{
          queriesCount: data?.client?.watchedQueries?.count,
          mutationsCount: data?.client?.mutationLog?.count,
        }}
        embeddedExplorerProps={{
          embeddedExplorerIFrame,
          setEmbeddedExplorerIFrame,
        }}
      />
    </>
  );
};

