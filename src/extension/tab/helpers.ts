import { DocumentNode, Source } from "graphql";

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