import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { useFragment } from "@apollo/client-3";
import { OperationBadge } from "./OperationBadge";
import { format } from "date-fns";
import type { WriteQueryListItem_cacheWrite } from "../types/gql";
import { getOperationName } from "@apollo/client/utilities/internal";
import { fragmentRegistry } from "../fragmentRegistry";

const FRAGMENT: TypedDocumentNode<WriteQueryListItem_cacheWrite> = gql`
  fragment WriteQueryListItem_cacheWrite on WriteQueryCacheWrite {
    writeQueryOptions: options
    timestamp
  }
`;

fragmentRegistry.register(FRAGMENT);

export function WriteQueryListItem({
  cacheWrite,
}: {
  cacheWrite: WriteQueryListItem_cacheWrite;
}) {
  const { data, complete } = useFragment({
    fragment: FRAGMENT,
    from: cacheWrite,
  });

  if (!complete) {
    return null;
  }

  const { timestamp, writeQueryOptions } = data;

  return (
    <div className="flex flex-col gap-1">
      <span className="font-code inline-flex items-center gap-2">
        {getOperationName(writeQueryOptions.query, "(anonymous)")}
        <OperationBadge document={writeQueryOptions.query} />
      </span>
      <span className="text-xs">
        {format(new Date(timestamp), "MMM do, yyyy pp")}
      </span>
    </div>
  );
}
