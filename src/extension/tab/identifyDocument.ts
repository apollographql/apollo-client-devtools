import type { DocumentNode } from "graphql";

export interface DocumentIdentity {
  kind: "query" | "mutation" | "subscription" | "fragment";
  name: string;
}

const identities = new WeakMap<DocumentNode, DocumentIdentity>();

// Fragment reads/writes/watches (`watchFragment`, `writeFragment`, etc.) go
// through the cache as an anonymous query whose only selection is a spread of
// the fragment, e.g. `query { ...MyFragment }`. These are reported as the
// fragment.
export function identifyDocument(document: DocumentNode): DocumentIdentity {
  let identity = identities.get(document);

  if (!identity) {
    identity = computeIdentity(document);
    identities.set(document, identity);
  }

  return identity;
}

function computeIdentity(document: DocumentNode): DocumentIdentity {
  const operation = document.definitions.find(
    (definition) => definition.kind === "OperationDefinition"
  );

  if (!operation) {
    const fragment = document.definitions.find(
      (definition) => definition.kind === "FragmentDefinition"
    );

    return { kind: "fragment", name: fragment?.name.value ?? "(anonymous)" };
  }

  const { selections } = operation.selectionSet;

  if (
    !operation.name &&
    selections.length === 1 &&
    selections[0].kind === "FragmentSpread"
  ) {
    return { kind: "fragment", name: selections[0].name.value };
  }

  return {
    kind: operation.operation,
    name: operation.name?.value ?? "(anonymous)",
  };
}
