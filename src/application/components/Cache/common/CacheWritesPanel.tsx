import { fragmentRegistry } from "@/application/fragmentRegistry";
import type { CacheWritesPanelFragment } from "@/application/types/gql";
import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { useFragment } from "@apollo/client/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { CodeBlock } from "../../CodeBlock";
import { memo, useState } from "react";
import { getOperationName } from "@apollo/client/utilities/internal";
import { List } from "../../List";
import { ListItem } from "../../ListItem";
import { format } from "date-fns";
import type { Diff } from "@/application/utilities/diff";
import { ObjectDiff } from "../../ObjectDiff";
import { ObjectViewer } from "../../ObjectViewer";
import { VariablesObject } from "../../VariablesObject";

const CACHE_WRITES_PANEL_FRAGMENT: TypedDocumentNode<CacheWritesPanelFragment> = gql`
  fragment CacheWritesPanelFragment on CacheWrite {
    id
    data
    document {
      string
      ast
    }
    timestamp
    variables
    cacheDiff
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

  const [selectedId, setSelectedId] = useState<string>();

  if (!complete) {
    return null;
  }

  const selectedCacheWrite = data.find(
    (cacheWrite) => cacheWrite.id === selectedId
  );

  return (
    <Panel
      id="cacheWrites"
      className="flex flex-col grow basis-1/2"
      minSize={10}
      defaultSize={25}
    >
      <h1 className="font-medium text-xl text-heading dark:text-heading-dark p-4 border-b border-b-primary dark:border-b-primary-dark">
        Cache writes
      </h1>
      <PanelGroup direction="horizontal" className="flex grow">
        <Panel id="cacheWriteList" className="grow !overflow-auto" minSize={25}>
          <List className="p-4">
            {[...data].reverse().map((cacheWrite) => (
              <ListItem
                key={cacheWrite.id}
                onClick={() => setSelectedId(cacheWrite.id)}
                selected={cacheWrite.id === selectedId}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-code">
                    {getOperationName(cacheWrite.document.ast)}
                  </span>
                  <span className="text-xs">
                    {format(new Date(cacheWrite.timestamp), "MMM do, yyyy pp")}
                  </span>
                </div>
              </ListItem>
            ))}
          </List>
        </Panel>
        {selectedCacheWrite && (
          <>
            <PanelResizeHandle className="border-l border-l-primary dark:border-l-primary-dark" />
            <Panel
              id="cacheWriteDetails"
              className="flex flex-col gap-4 grow p-4 !overflow-auto"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-md text-heading dark:text-heading-dark">
                  Operation
                </h2>
                <CodeBlock
                  language="graphql"
                  code={selectedCacheWrite.document.string}
                />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-md text-heading dark:text-heading-dark">
                  Data
                </h2>
                <ObjectViewer value={selectedCacheWrite.data} />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-md text-heading dark:text-heading-dark">
                  Variables
                </h2>
                <VariablesObject
                  variables={selectedCacheWrite.variables ?? undefined}
                />
              </div>
              <DiffView
                key={selectedCacheWrite.id}
                diff={selectedCacheWrite.cacheDiff}
              />
            </Panel>
          </>
        )}
      </PanelGroup>
    </Panel>
  );
}

const DiffView = memo(({ diff }: { diff: Diff | null }) => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-md text-heading dark:text-heading-dark">Diff</h2>
      {diff === null ? (
        <span className="text-disabled dark:text-disabled-dark">Unchanged</span>
      ) : (
        <ObjectDiff diff={diff} />
      )}
    </div>
  );
});
