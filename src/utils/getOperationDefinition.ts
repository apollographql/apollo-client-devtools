import type { DocumentNode, OperationDefinitionNode } from "graphql";

export function getOperationDefinition(
  doc: DocumentNode
): OperationDefinitionNode | undefined {
  return doc.definitions.filter(
    (definition): definition is OperationDefinitionNode =>
      definition.kind === "OperationDefinition"
  )[0];
}
