import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { useFragment } from "@apollo/client-3";
import { OperationBadge } from "./OperationBadge";
import { format } from "date-fns";
import type { WriteFragmentListItem_cacheWrite } from "../types/gql";
import { getOperationName } from "@apollo/client/utilities/internal";
import { fragmentRegistry } from "../fragmentRegistry";

const FRAGMENT: TypedDocumentNode<WriteFragmentListItem_cacheWrite> = gql`
  fragment WriteFragmentListItem_cacheWrite on WriteFragmentCacheWrite {
    writeFragmentOptions: options
    timestamp
  }
`;

fragmentRegistry.register(FRAGMENT);

export function WriteFragmentListItem({
  cacheWrite,
}: {
  cacheWrite: WriteFragmentListItem_cacheWrite;
}) {
  const { data, complete } = useFragment({
    fragment: FRAGMENT,
    from: cacheWrite,
  });

  if (!complete) {
    return null;
  }

  const { timestamp, writeFragmentOptions } = data;

  return (
    <div className="flex flex-col gap-1">
      <span className="font-code inline-flex items-center gap-1">
        {getOperationName(writeFragmentOptions.fragment, "(anonymous)")}
        <OperationBadge document={writeFragmentOptions.fragment} />
      </span>
      <span className="text-xs">
        {format(new Date(timestamp), "MMM do, yyyy pp")}
      </span>
    </div>
  );
}
