import type { DocumentNode } from "@apollo/client";
import {
  getMainDefinition,
  getOperationDefinition,
} from "@apollo/client/utilities/internal";
import { Badge } from "./Badge";
import { Kind } from "graphql";

interface Props {
  document: DocumentNode;
}

export function OperationBadge({ document }: Props) {
  const definition = getMainDefinition(document);
  const kind =
    definition.kind === Kind.OPERATION_DEFINITION ? definition.operation : "F";

  return (
    <Badge
      variant="info"
      className="font-code shrink-0 size-5 inline-flex items-center justify-center"
    >
      {kind.at(0)?.toUpperCase()}
    </Badge>
  );
}
