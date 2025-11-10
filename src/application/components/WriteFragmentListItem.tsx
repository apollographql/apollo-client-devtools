import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { useFragment } from "@apollo/client-3";
import { format } from "date-fns";
import type { WriteFragmentListItem_cacheWrite } from "../types/gql";
import { fragmentRegistry } from "../fragmentRegistry";
import type { FragmentDefinitionNode } from "graphql";
import { Kind } from "graphql";
import { Badge } from "./Badge";

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
  const { fragmentName } = writeFragmentOptions;

  const fragments = writeFragmentOptions.fragment.definitions.filter(
    (node): node is FragmentDefinitionNode =>
      node.kind === Kind.FRAGMENT_DEFINITION
  );

  return (
    <div className="flex flex-col gap-1">
      <span className="font-code inline-flex items-center gap-2">
        {fragmentName ?? fragments[0].name.value}
        <Badge variant="info" className="font-code">
          F
        </Badge>
      </span>
      <span className="text-xs">
        {format(new Date(timestamp), "MMM do, yyyy pp")}
      </span>
    </div>
  );
}
