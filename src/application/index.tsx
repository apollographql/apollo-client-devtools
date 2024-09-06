import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { Reference } from "@apollo/client";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";

import { colorTheme, listenForThemeChange } from "./theme";
import { App } from "./App";
import { fragmentRegistry } from "./fragmentRegistry";
import * as Tooltip from "@radix-ui/react-tooltip";

import { getRpcClient } from "../extension/devtools/panelRpcClient";
import { createSchemaWithRpcClient } from "./schema";
import type {
  DevToolsActor,
  DevToolsMachineEvents,
} from "./machines/devtoolsMachine";
import {
  devtoolsMachine,
  DevToolsMachineContext,
} from "./machines/devtoolsMachine";
import { createActor } from "xstate";
import type {
  Actor as WindowActor,
  ActorMessage as WindowActorMessage,
} from "../extension/actor";

const rpcClient = getRpcClient();
const schema = createSchemaWithRpcClient(rpcClient);
const link = new SchemaLink({ schema });

const cache = new InMemoryCache({
  fragments: fragmentRegistry,
  possibleTypes: {
    WatchedMutationError: ["SerializedError", "SerializedApolloError"],
  },
  typePolicies: {
    WatchedQuery: {
      fields: {
        name(_) {
          return _ ?? "(anonymous)";
        },
      },
    },
    WatchedMutation: {
      fields: {
        name(_) {
          return _ ?? "(anonymous)";
        },
      },
    },
    Client: {
      fields: {
        cache: {
          merge: false,
        },
      },
    },
    ClientQueries: {
      keyFields: false,
      merge: true,
    },
    ClientMutations: {
      keyFields: false,
      merge: true,
    },
    SerializedApolloError: {
      keyFields: false,
    },
    SerializedGraphQLError: {
      keyFields: false,
    },
  },
});

export const client = new ApolloClient({ cache, link });

export const removeClient = (clientId: string) => {
  client.cache.modify({
    id: "ROOT_QUERY",
    fields: {
      clients: (clients, { readField }) => {
        return clients.filter(
          (client: Reference) => readField("id", client) !== clientId
        );
      },
    },
  });
};

export const AppProvider = ({ actor }: { actor: DevToolsActor }) => {
  useEffect(() =>
    listenForThemeChange((newColorTheme) => colorTheme(newColorTheme))
  );

  return (
    <Tooltip.Provider delayDuration={0}>
      <ApolloProvider client={client}>
        <DevToolsMachineContext.Provider value={actor}>
          <App />
        </DevToolsMachineContext.Provider>
      </ApolloProvider>
    </Tooltip.Provider>
  );
};

function noop() {}
const actor = createActor(
  devtoolsMachine.provide({
    actions: {
      resetStore: async ({ self }) => {
        await client.clearStore().catch(noop);
        self.send({ type: "store.didReset" });
      },
      renderUI() {
        const root = createRoot(
          document.getElementById("devtools") as HTMLElement
        );
        root.render(<AppProvider actor={actor} />);
      },
    },
  })
);
actor.start();

// debugging
actor.on("*", (event) => console.log(event));
actor.subscribe((snapshot) => console.log(snapshot.value, snapshot.context));

export const forwardDevToolsActorEvent = (
  windowActor: WindowActor,
  types: Array<
    Extract<DevToolsMachineEvents["type"], WindowActorMessage["type"]>
  >
) => {
  for (const type of types) {
    windowActor.on(type, (event) => actor.send(event));
  }
};
