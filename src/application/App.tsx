import React, { useEffect, useState } from "react";
import { useReactiveVar, gql, useQuery, makeVar } from "@apollo/client";

import { currentScreen, Screens } from "./components/Layouts/Navigation";
import { Queries } from "./components/Queries/Queries";
import { Mutations } from "./components/Mutations/Mutations";
import { Explorer } from "./components/Explorer/Explorer";
import { Cache } from "./components/Cache/Cache";

export const reloadStatus = makeVar<boolean>(false);

const screens = {
  [Screens.Explorer]: Explorer,
  [Screens.Queries]: Queries,
  [Screens.Mutations]: Mutations,
  [Screens.Cache]: Cache,
};

const GET_OPERATION_COUNTS = gql`
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
  const { data } = useQuery(GET_OPERATION_COUNTS);
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
      {selected !== Screens.Explorer &&
        <Screen
          navigationProps={{
            queriesCount: data?.watchedQueries?.count,
            mutationsCount: data?.mutationLog?.count,
          }}
          embeddedExplorerProps={{
            embeddedExplorerIFrame,
            setEmbeddedExplorerIFrame
          }}
        />
      }
      {
        /**
         * We need to keep the iframe inside of the `Explorer` loaded at all times
         * so that we don't reload the iframe when we come to this tab
         */
      }
      <Explorer
        navigationProps={{
          queriesCount: data?.watchedQueries?.count,
          mutationsCount: data?.mutationLog?.count,
        }}
        embeddedExplorerProps={{
          embeddedExplorerIFrame,
          setEmbeddedExplorerIFrame,
        }}
      />
    </>
  );
};
