import type { DocumentNode, FieldNode, SelectionSetNode } from "graphql";
import { Kind, visit } from "graphql";

type Writable<T> = { -readonly [P in keyof T]: T[P] };

export function selectsField(path: string[], selectionSet: SelectionSetNode) {
  const [field, ...rest] = path;
  const selection = getSelection(field, selectionSet);

  if (!selection) {
    return false;
  }

  if (rest.length === 0) {
    return true;
  }

  if (!selection.selectionSet) {
    return false;
  }

  return selectsField(rest, selection.selectionSet);
}

function getSelection(
  fieldName: string,
  selectionSet: SelectionSetNode
): FieldNode | undefined {
  return selectionSet.selections.find((selection): selection is FieldNode => {
    switch (selection.kind) {
      case Kind.FIELD:
        return selection.name.value === fieldName;
      default:
        throw new Error(
          `${selection.kind} not supported when determining if selected`
        );
    }
  });
}

export function filterDocumentForOperation(
  document: DocumentNode,
  operationName: string | undefined
): DocumentNode {
  const cloned = JSON.parse(JSON.stringify(document)) as Writable<DocumentNode>;

  cloned.definitions = document.definitions.filter((definition) => {
    return (
      definition.kind !== Kind.OPERATION_DEFINITION ||
      definition.name?.value === operationName
    );
  });

  return cloned;
}

export function unmaskFragmentSpreads(document: DocumentNode): DocumentNode {
  return visit(document, {
    FragmentSpread(node) {
      return {
        ...node,
        directives: [
          ...(node.directives ?? []),
          { kind: Kind.DIRECTIVE, name: { kind: Kind.NAME, value: "unmask" } },
        ],
      };
    },
  });
}
