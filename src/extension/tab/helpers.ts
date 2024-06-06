import type { ObservableQuery, WatchQueryOptions } from "@apollo/client";
import type { Cache } from "@apollo/client/cache";
import type {
  DocumentNode,
  OperationDefinitionNode,
  FragmentDefinitionNode,
} from "graphql/language";
import type { QueryData, Variables } from "../../application/types/scalars";
import { getPrivateAccess } from "../../privateAccess";
import { getOperationName } from "@apollo/client/utilities";
import { pick } from "../../application/utilities/pick";

export type QueryOptions = Pick<
  WatchQueryOptions,
  | "context"
  | "fetchPolicy"
  | "errorPolicy"
  | "pollInterval"
  | "partialRefetch"
  | "canonizeResults"
  | "returnPartialData"
  | "refetchWritePolicy"
  | "notifyOnNetworkStatusChange"
> & { nextFetchPolicy?: string };

export type QueryInfo = {
  document: DocumentNode;
  variables?: Variables;
  cachedData?: QueryData; // Not a member of the actual Apollo Client QueryInfo type
  options?: QueryOptions;
};

// Transform the map of observable queries into a list of QueryInfo objects usable by DevTools
export function getQueries(
  observableQueries: Map<string, ObservableQuery>
): QueryInfo[] {
  const queries: QueryInfo[] = [];
  if (observableQueries) {
    observableQueries.forEach((oc) => {
      const observableQuery = getPrivateAccess(oc);
      const { document, variables } = observableQuery.queryInfo;
      const diff = observableQuery.queryInfo.getDiff();
      if (!document) return;
      const name = getOperationName(document);
      if (name === "IntrospectionQuery") {
        return;
      }
      queries.push({
        document,
        variables,
        cachedData: diff.result,
        options: getQueryOptions(oc),
      });
    });
  }
  return queries;
}

function getQueryOptions(observableQuery: ObservableQuery) {
  const { options } = observableQuery;

  const queryOptions = {
    ...pick(options, [
      "context",
      "pollInterval",
      "partialRefetch",
      "canonizeResults",
      "returnPartialData",
      "refetchWritePolicy",
      "notifyOnNetworkStatusChange",
      "fetchPolicy",
      "errorPolicy",
    ]),
    nextFetchPolicy:
      typeof options.nextFetchPolicy === "function"
        ? "<function>"
        : options.nextFetchPolicy,
  };

  if (queryOptions.nextFetchPolicy == null) {
    delete queryOptions.nextFetchPolicy;
  }

  return queryOptions;
}

// Version of getQueries compatible with Apollo Client versions < 3.4.0
export function getQueriesLegacy(
  queryMap: Map<
    string,
    {
      document: DocumentNode;
      variables: Variables;
      diff: Cache.DiffResult<any>;
    }
  >
): QueryInfo[] {
  let queries: QueryInfo[] = [];
  if (queryMap) {
    queries = [...queryMap.values()].map(({ document, variables, diff }) => ({
      document,
      variables,
      cachedData: diff?.result,
    }));
  }
  return queries;
}

export function getMutations(
  mutationsObj: Record<string, { mutation: DocumentNode; variables: Variables }>
): QueryInfo[] {
  const keys = Object.keys(mutationsObj);

  if (keys.length === 0) {
    return [];
  }

  return keys.map((key) => {
    const { mutation, variables } = mutationsObj[key];
    return {
      document: mutation,
      variables,
    };
  });
}

export function getMainDefinition(
  queryDoc: DocumentNode
): OperationDefinitionNode | FragmentDefinitionNode {
  let fragmentDefinition;

  for (const definition of queryDoc.definitions) {
    if (definition.kind === "OperationDefinition") {
      const operation = (definition as OperationDefinitionNode).operation;
      if (
        operation === "query" ||
        operation === "mutation" ||
        operation === "subscription"
      ) {
        return definition as OperationDefinitionNode;
      }
    }
    if (definition.kind === "FragmentDefinition" && !fragmentDefinition) {
      // we do this because we want to allow multiple fragment definitions
      // to precede an operation definition.
      fragmentDefinition = definition as FragmentDefinitionNode;
    }
  }

  if (fragmentDefinition) {
    return fragmentDefinition;
  }

  throw new Error(
    "Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment."
  );
}
