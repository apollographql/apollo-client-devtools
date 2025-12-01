import type { DocumentNode } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities/internal";
import { Badge } from "./Badge";
import { Kind } from "graphql";
import { Tooltip } from "./Tooltip";

interface Props {
  document: DocumentNode;
}

export function OperationBadge({ document }: Props) {
  const definition = getMainDefinition(document);
  const kind =
    definition.kind === Kind.OPERATION_DEFINITION
      ? definition.operation
      : "fragment";

  return (
    <Tooltip
      content={kind.slice(0, 1).toUpperCase() + kind.slice(1)}
      delayDuration={1000}
    >
      <Badge
        variant="info"
        className="font-code shrink-0 size-5 inline-flex items-center justify-center"
      >
        {kind.at(0)?.toUpperCase()}
      </Badge>
    </Tooltip>
  );
}
