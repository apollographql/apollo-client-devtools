import {
  DocumentNode,
  Source,
  OperationDefinitionNode,
  FragmentDefinitionNode,
} from "graphql/language";

export type QueryInfo = {
  document: DocumentNode;
  source?: Source,
  variables?: Record<string, any>;
  diff?: Record<string, any>;
}

export function getQueries(queryMap): QueryInfo[] {
  let queries: QueryInfo[] = [];

  if (queryMap) {
    queries = [...queryMap.values()].map(({
      document,
      variables,
      diff,
    }) => ({
        document,
        source: document?.loc?.source,
        variables,
        cachedData: diff?.result,
      })
    )
  }

  return queries;
}

export function getMutations(mutationsObj): QueryInfo[] {
  const keys = Object.keys(mutationsObj);

  if (keys.length === 0) {
    return [];
  }

  return keys.map(key => {
    const { mutation, variables } = mutationsObj[key];
    return {
      document: mutation,
      variables,
      source: mutation?.loc?.source,
    }
  });
}

export function getMainDefinition(
  queryDoc: DocumentNode
): OperationDefinitionNode | FragmentDefinitionNode {
  let fragmentDefinition;

  for (let definition of queryDoc.definitions) {
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
