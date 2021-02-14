import React, { useEffect } from "react";
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

export const App = () => {
  const { data } = useQuery(GET_OPERATION_COUNTS);
  const selected = useReactiveVar<Screens>(currentScreen);
  const reloading = useReactiveVar<boolean>(reloadStatus);
  let Screen = screens[selected];

  // During a reload, reset the current screen to Queries.
  useEffect(() => {
    if (reloading && selected !== Screens.Queries) {
      currentScreen(Screens.Queries);
    }
  }, [reloading]);

  if (reloading) {
    return <div></div>;
  }

  return (
    <Screen
      navigationProps={{
        queriesCount: data?.watchedQueries?.count,
        mutationsCount: data?.mutationLog?.count,
      }}
    />
  );
};
