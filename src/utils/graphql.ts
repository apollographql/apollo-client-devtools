import type { FieldNode, SelectionSetNode } from "graphql";
import { Kind } from "graphql";

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
