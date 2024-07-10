import type { ApolloClient, ApolloError } from "@apollo/client";

// Note that we are intentionally not using Apollo Client's gql and
// Observable exports, as we don't want Apollo Client and its dependencies
// to be loaded into each browser tab, when this hook triggered.
import Observable from "zen-observable";
import type { DefinitionNode } from "graphql/language";

type Writable<T> = { -readonly [P in keyof T]: T[P] };

// All manifests should contain the same version number so it shouldn't matter
// which one we import from.
import * as manifest from "../chrome/manifest.json";
const { version: devtoolsVersion } = manifest;
import type { MutationDetails, QueryDetails } from "./helpers";
import {
  getQueries,
  getQueriesLegacy,
  getMutations,
  getMainDefinition,
} from "./helpers";
import type { QueryResult, SafeAny } from "../../types";
import { getPrivateAccess } from "../../privateAccess";
import type { JSONObject } from "../../application/types/json";
import { createWindowActor } from "../actor";
import type { ClientMessage, DevtoolsRPCMessage } from "../messages";
import { createWindowMessageAdapter } from "../messageAdapters";
import { createRpcClient, createRpcHandler } from "../rpc";
import type { ErrorCodesHandler } from "../background/errorcodes";
import { loadErrorCodes } from "./loadErrorCodes";

declare global {
  type TCache = any;

  interface Window {
    __APOLLO_CLIENT__?: ApolloClient<TCache>;
    [DEVTOOLS_KEY]?: {
      push(client: ApolloClient<any>): void;
    };
  }
}

type Hook = {
  ApolloClient: ApolloClient<any> | undefined;
  version: string;
  getQueries: () => QueryDetails[];
  getMutations: () => MutationDetails[];
  getCache: () => JSONObject;
};

const DEVTOOLS_KEY = Symbol.for("apollo.devtools");

const tab = createWindowActor<ClientMessage>(window);
const messageAdapter = createWindowMessageAdapter(window);
const handleRpc = createRpcHandler<DevtoolsRPCMessage>(messageAdapter);
const rpcClient = createRpcClient<ErrorCodesHandler>(messageAdapter);
const knownClients = new Set<ApolloClient<any>>();
const hook: Hook = {
  ApolloClient: undefined,
  version: devtoolsVersion,
  getQueries() {
    const ac = getPrivateAccess(hook.ApolloClient);
    if (ac?.queryManager.getObservableQueries) {
      return getQueries(ac.queryManager.getObservableQueries("active"));
    } else {
      return getQueriesLegacy(ac?.queryManager["queries"]);
    }
  },
  getMutations: () => {
    const ac = getPrivateAccess(hook.ApolloClient);
    return getMutations(
      (ac?.queryManager.mutationStore?.getStore
        ? // @ts-expect-error Apollo Client 3.0 - 3.2
          ac.queryManager.mutationStore?.getStore()
        : // Apollo Client 3.3
          ac?.queryManager.mutationStore) ?? {}
    );
  },
  getCache: () => hook.ApolloClient?.cache.extract(true) ?? {},
};

Object.defineProperty(window, "__APOLLO_DEVTOOLS_GLOBAL_HOOK__", {
  get() {
    return hook;
  },
  configurable: true,
});

function getClientData() {
  // We need to JSON stringify the data here in case the cache contains
  // references to irregular data such as `URL` instances which are not
  // cloneable via `structuredClone` (which `window.postMessage` uses to
  // send messages). `JSON.stringify` does however serialize `URL`s into
  // strings properly, so this should ensure that the cache data will be
  // sent without errors.
  //
  // https://github.com/apollographql/apollo-client-devtools/issues/1258
  return JSON.parse(
    JSON.stringify({
      clientVersion: hook.ApolloClient?.version ?? null,
      queries: hook.getQueries(),
      mutations: hook.getMutations(),
      cache: hook.getCache(),
    })
  ) as {
    clientVersion: string | null;
    queries: QueryDetails[];
    mutations: MutationDetails[];
    cache: JSONObject;
  };
}

handleRpc("getClientOperations", getClientData);

tab.on("connectToClient", () => {
  if (hook.ApolloClient) {
    tab.send({ type: "connectToDevtools" });
  }
});

tab.on("explorerRequest", (message) => {
  const {
    operation: queryAst,
    operationName,
    fetchPolicy,
    variables,
  } = message.payload;

  const clonedQueryAst = structuredClone(queryAst) as Writable<typeof queryAst>;

  const filteredDefinitions = clonedQueryAst.definitions.reduce(
    (acumm: DefinitionNode[], curr) => {
      if (
        (curr.kind === "OperationDefinition" &&
          curr.name?.value === operationName) ||
        curr.kind !== "OperationDefinition"
      ) {
        acumm.push(curr);
      }

      return acumm;
    },
    []
  );

  clonedQueryAst.definitions = filteredDefinitions;

  const definition = getMainDefinition(clonedQueryAst);

  const operation = (() => {
    if (
      definition.kind === "OperationDefinition" &&
      definition.operation === "mutation"
    ) {
      return new Observable<QueryResult>((observer) => {
        hook.ApolloClient?.mutate({
          mutation: clonedQueryAst,
          variables,
        }).then((result) => {
          observer.next(result as QueryResult);
        });
      });
    } else {
      return hook.ApolloClient?.watchQuery({
        query: clonedQueryAst,
        variables,
        fetchPolicy,
      });
    }
  })();

  const operationObservable = operation?.subscribe(
    (response: QueryResult) => {
      tab.send({
        type: "explorerResponse",
        payload: { operationName, response },
      });
    },
    (error: ApolloError) => {
      tab.send({
        type: "explorerResponse",
        payload: {
          operationName,
          response: {
            errors: error.graphQLErrors.length
              ? error.graphQLErrors
              : error.networkError && "result" in error.networkError
                ? typeof error.networkError?.result === "string"
                  ? error.networkError?.result
                  : error.networkError?.result.errors ?? []
                : [],
            error: error,
            data: null,
            loading: false,
            networkStatus: 8, // NetworkStatus.error - we want to prevent importing the enum here
          },
        },
      });
    }
  );

  if (
    definition.kind === "OperationDefinition" &&
    definition.operation === "subscription"
  ) {
    tab.on("explorerSubscriptionTermination", () => {
      operationObservable?.unsubscribe();
    });
  }
});

function watchForClientTermination(client: ApolloClient<any>) {
  const originalStop = client.stop;

  client.stop = () => {
    knownClients.delete(client);

    if (window.__APOLLO_CLIENT__ === client) {
      window.__APOLLO_CLIENT__ = undefined;
    }

    if (hook.ApolloClient === client) {
      hook.ApolloClient = undefined;
    }

    tab.send({ type: "clientTerminated" });
    originalStop.call(client);
  };
}

function registerClient(client: ApolloClient<any>) {
  if (!knownClients.has(client)) {
    knownClients.add(client);
    watchForClientTermination(client);
    tab.send({ type: "registerClient" });
  }

  hook.ApolloClient = client;
  // TODO: Repurpose this callback. The message it sent was not listened by
  // anything, so the broadcast was useless. Currently the devtools rely on
  // polling the client every second for updates, rather than relying on
  // this callback to update the devtools state.
  // client.__actionHookForDevTools(() => {
  //   if (client !== hook.ApolloClient) {
  //     // if the client has changed, don't send the action hook
  //     return;
  //   }
  // });

  loadErrorCodes(rpcClient, client.version);
}

const preExisting = window[DEVTOOLS_KEY];
window[DEVTOOLS_KEY] = { push: registerClient };
if (Array.isArray(preExisting)) {
  (preExisting as Array<ApolloClient<any>>).forEach(registerClient);
}

// Handles registering legacy clients (< v3.7) which do not use the new
// registration mechanism above.
let globalClient = window.__APOLLO_CLIENT__;
Object.defineProperty(window, "__APOLLO_CLIENT__", {
  get() {
    return globalClient;
  },
  set(client: ApolloClient<SafeAny> | undefined) {
    if (client) {
      // We call this in a setTimeout because the client is not fully
      // instantiated before the property on window is assigned since it
      // connects from the constructor of ApolloClient. This allows
      // initialization to finish before we register it.
      setTimeout(() => registerClient(client));
    }

    globalClient = client;
  },
  configurable: true,
});

if (globalClient) {
  registerClient(globalClient);
}
