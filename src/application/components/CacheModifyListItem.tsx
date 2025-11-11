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
  const id = modifyOptions.id ?? "ROOT_QUERY";

  return (
    <div className="flex flex-col gap-1">
      <span className="overflow-hidden text-ellipsis">
        cache.<span className="text-code-e dark:text-code-e-dark">modify</span>(
        <span className="text-code-d dark:text-code-d-dark" title={id}>
          {id}
        </span>
        )
      </span>
      <span className="text-xs text-secondary dark:text-secondary-dark">
        {format(new Date(timestamp), "MMM do, yyyy pp")}
      </span>
    </div>
  );
}
