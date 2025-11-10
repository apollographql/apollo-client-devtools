import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { useFragment } from "@apollo/client-3";
import { OperationBadge } from "./OperationBadge";
import { format } from "date-fns";
import type { DirectCacheWriteListItem_cacheWrite } from "../types/gql";
import { getOperationName } from "@apollo/client/utilities/internal";
import { fragmentRegistry } from "../fragmentRegistry";

const FRAGMENT: TypedDocumentNode<DirectCacheWriteListItem_cacheWrite> = gql`
  fragment DirectCacheWriteListItem_cacheWrite on DirectCacheWrite {
    writeOptions: options
    timestamp
  }
`;

fragmentRegistry.register(FRAGMENT);

export function DirectCacheWriteListItem({
  cacheWrite,
}: {
  cacheWrite: DirectCacheWriteListItem_cacheWrite;
}) {
  const { data, complete } = useFragment({
    fragment: FRAGMENT,
    from: cacheWrite,
  });

  if (!complete) {
    return null;
  }

  const { timestamp, writeOptions } = data;

  return (
    <div className="flex flex-col gap-1">
      <span className="font-code inline-flex items-center gap-1">
        {getOperationName(writeOptions.query, "(anonymous)")}
        <OperationBadge document={writeOptions.query} />
      </span>
      <span className="text-xs">
        {format(new Date(timestamp), "MMM do, yyyy pp")}
      </span>
    </div>
  );
}
