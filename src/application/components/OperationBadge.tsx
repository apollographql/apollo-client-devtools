import type { DocumentNode } from "@apollo/client";
import { getOperationDefinition } from "@apollo/client/utilities/internal";
import { Badge } from "./Badge";

interface Props {
  document: DocumentNode;
}

export function OperationBadge({ document }: Props) {
  const { operation } = getOperationDefinition(document)!;

  return (
    <Badge variant="info" className="font-code">
      {operation.at(0)?.toUpperCase()}
    </Badge>
  );
}
