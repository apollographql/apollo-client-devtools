import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { useFragment } from "@apollo/client-3";
import { format } from "date-fns";
import type { CacheModifyListItem_cacheWrite } from "../types/gql";
import { Badge } from "./Badge";
import { fragmentRegistry } from "../fragmentRegistry";

const FRAGMENT: TypedDocumentNode<CacheModifyListItem_cacheWrite> = gql`
  fragment CacheModifyListItem_cacheWrite on CacheModifyWrite {
    modifyOptions: options
    timestamp
  }
`;

fragmentRegistry.register(FRAGMENT);

export function CacheModifyListItem({
  cacheWrite,
}: {
  cacheWrite: CacheModifyListItem_cacheWrite;
}) {
  const { data, complete } = useFragment({
    fragment: FRAGMENT,
    from: cacheWrite,
  });

  if (!complete) {
    return null;
  }

  const { timestamp, modifyOptions } = data;

  return (
    <div className="flex flex-col gap-1">
      <span className="font-code inline-flex items-center gap-2">
        {modifyOptions.id ?? "Root query"}
        <Badge variant="info" className="font-code">
          modify
        </Badge>
      </span>
      <span className="text-xs">
        {format(new Date(timestamp), "MMM do, yyyy pp")}
      </span>
    </div>
  );
}
