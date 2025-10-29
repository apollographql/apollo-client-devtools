import { fragmentRegistry } from "@/application/fragmentRegistry";
import type { CacheWritesPanelFragment } from "@/application/types/gql";
import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { useFragment } from "@apollo/client/react";
import { Panel } from "react-resizable-panels";

const CACHE_WRITES_PANEL_FRAGMENT: TypedDocumentNode<CacheWritesPanelFragment> = gql`
  fragment CacheWritesPanelFragment on CacheWrite {
    id
    data
  }
`;

fragmentRegistry.register(CACHE_WRITES_PANEL_FRAGMENT);

interface Props {
  cacheWrites: Array<{ __typename: "CacheWrite"; id: string }>;
}

export function CacheWritesPanel({ cacheWrites }: Props) {
  const { data, complete } = useFragment({
    fragment: CACHE_WRITES_PANEL_FRAGMENT,
    from: cacheWrites,
  });

  if (!complete) {
    return null;
  }

  return (
    <Panel
      id="cacheWrites"
      className="!overflow-auto flex flex-col basis-1/2 p-4"
      minSize={10}
      defaultSize={25}
    >
      <h1>Cache writes</h1>
      {data.map((cacheWrite) => (
        <div key={cacheWrite.id}>{JSON.stringify(data, null, 2)}</div>
      ))}
    </Panel>
  );
}
