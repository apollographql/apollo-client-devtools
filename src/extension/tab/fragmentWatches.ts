import type { DocumentNode } from "graphql";
import { canonicalStringify } from "@apollo/client/utilities";
import type { ApolloClient } from "@/types";
import type { JSONObject } from "@/application/types/json";
import type { FragmentWatch, FragmentWatchData } from "./shared/types";
import { identifyDocument } from "./identifyDocument";

interface CacheWatch {
  query: DocumentNode;
  id?: string;
  variables?: JSONObject;
  optimistic?: boolean;
}

function getEntityKey(id: string | null, variables: JSONObject | null) {
  return `${id}:${canonicalStringify(variables ?? {})}`;
}

function getWatches(client: ApolloClient) {
  const watches = (client.cache as { watches?: Set<CacheWatch> }).watches;

  return watches instanceof Set ? watches : undefined;
}

const fragmentDocuments = new WeakMap<DocumentNode, DocumentNode>();

function getFragmentDocument(query: DocumentNode) {
  let document = fragmentDocuments.get(query);

  if (!document) {
    document = {
      kind: query.kind,
      definitions: query.definitions.filter(
        (definition) => definition.kind === "FragmentDefinition"
      ),
    };
    fragmentDocuments.set(query, document);
  }

  return document;
}

export function getFragmentWatchCount(client: ApolloClient) {
  let count = 0;

  getWatches(client)?.forEach((watch) => {
    if (identifyDocument(watch.query).kind === "fragment") {
      count++;
    }
  });

  return count;
}

export function getFragmentWatches(client: ApolloClient): FragmentWatch[] {
  const byName = new Map<
    string,
    {
      document: DocumentNode;
      count: number;
      entities: Map<
        string,
        { id: string | null; variables: JSONObject | null }
      >;
    }
  >();

  getWatches(client)?.forEach((watch) => {
    const { kind, name } = identifyDocument(watch.query);

    if (kind !== "fragment") {
      return;
    }

    let entry = byName.get(name);

    if (!entry) {
      entry = {
        document: getFragmentDocument(watch.query),
        count: 0,
        entities: new Map(),
      };
      byName.set(name, entry);
    }

    const id = watch.id ?? null;
    const variables = watch.variables ?? null;
    const key = getEntityKey(id, variables);

    entry.count++;

    if (!entry.entities.has(key)) {
      entry.entities.set(key, { id, variables });
    }
  });

  return Array.from(byName, ([name, { document, count, entities }]) => ({
    name,
    document,
    count,
    entities: Array.from(entities.values()),
  })).sort((a, b) => b.count - a.count);
}

// Reads the current cached data for a single fragment watch
export function getFragmentWatchData(
  client: ApolloClient,
  options: {
    fragmentName: string;
    id: string | null;
    variables: JSONObject | null;
  }
): FragmentWatchData | null {
  const key = getEntityKey(options.id, options.variables);
  let match: CacheWatch | undefined;

  getWatches(client)?.forEach((watch) => {
    if (
      !match &&
      identifyDocument(watch.query).name === options.fragmentName &&
      identifyDocument(watch.query).kind === "fragment" &&
      getEntityKey(watch.id ?? null, watch.variables ?? null) === key
    ) {
      match = watch;
    }
  });

  if (!match?.id) {
    return null;
  }

  const { query, id, variables, optimistic = true } = match;
  const diff = (client.cache as any).diff({
    query,
    id,
    variables,
    optimistic,
    returnPartialData: true,
  });

  return { data: diff.result ?? null, complete: diff.complete };
}
