import { fragmentRegistry } from "@/application/fragmentRegistry";
import type { CacheWritesPanelFragment } from "@/application/types/gql";
import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { useFragment } from "@apollo/client/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { JSONTreeViewer } from "../../JSONTreeViewer";
import { CodeBlock } from "../../CodeBlock";
import type { CSSProperties, FC } from "react";
import { memo, useState } from "react";
import { getOperationName } from "@apollo/client/utilities/internal";
import { List } from "../../List";
import { ListItem } from "../../ListItem";
import { format } from "date-fns";
import { Added } from "@/application/utilities/diff";
import { Changed, Deleted, type Diff } from "@/application/utilities/diff";
import { ObjectViewer } from "../../ObjectViewer";
import type { CustomRenderProps } from "../../ObjectViewer/ObjectViewer";
import type { ColorValue } from "../../ObjectViewer/useObjectViewerTheme";
import { useGetObjectViewerThemeOverride } from "../../ObjectViewer/useObjectViewerTheme";
import { colors } from "@apollo/brand";
import { clsx } from "clsx";

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
                  <span className="font-code text-lg">
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
                <JSONTreeViewer data={selectedCacheWrite.data} hideRoot />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-md text-heading dark:text-heading-dark">
                  Variables
                </h2>
                {selectedCacheWrite.variables === null ? (
                  <span className="text-disabled dark:text-disabled-dark">
                    undefined
                  </span>
                ) : (
                  <JSONTreeViewer
                    data={selectedCacheWrite.variables}
                    hideRoot
                  />
                )}
              </div>
              <DiffView diff={selectedCacheWrite.cacheDiff} />
            </Panel>
          </>
        )}
      </PanelGroup>
    </Panel>
  );
}

const TEST = true;

const DiffView = memo(function DiffView({ diff }: { diff: Diff | null }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-md text-heading dark:text-heading-dark">Diff</h2>
      {diff === null ? (
        <span className="text-disabled dark:text-disabled-dark">Unchanged</span>
      ) : (
        <ObjectViewer
          value={
            TEST
              ? {
                  b: {
                    f: Symbol("a"),
                    func: function () {
                      return "test";
                    },
                    c: [
                      null,
                      new Changed(0, 1),
                      new Changed(1, 2),
                      new Deleted("test"),
                      new Added(3),
                    ],
                    d: {
                      e: {
                        f: new Changed(true, false),
                        g: new Added(true),
                      },
                    },
                  },
                  foo: new Deleted(true),
                  bar: [undefined, new Deleted(1)],
                  baz: [
                    undefined,
                    { b: new Changed(2, 3), c: new Added(2) },
                    new Deleted({ c: 2 }),
                  ],
                }
              : diff
          }
          getTypeOf={(value) => {
            if (value instanceof Changed) {
              return "Changed";
            }
          }}
          customRenderers={{
            Changed: ChangedValue,
          }}
          builtinRenderers={{
            arrayItem: DiffValue,
            arrayIndex: StrikethroughWhenDeleted,
            collapsedArray: StrikethroughWhenDeleted,
            collapsedObject: StrikethroughWhenDeleted,
            objectPair: DiffValue,
            string: StrikethroughWhenDeleted,
            boolean: StrikethroughWhenDeleted,
            number: StrikethroughWhenDeleted,
            null: StrikethroughWhenDeleted,
            undefined: StrikethroughWhenDeleted,
            objectKey: StrikethroughWhenDeleted,
          }}
        />
      )}
    </div>
  );
});

const { text } = colors.tokens;

function StrikethroughWhenDeleted({
  className,
  context,
  DefaultRender,
}: {
  className?: string;
  context?: Record<string, any>;
  DefaultRender: FC<{ className?: string }>;
}) {
  return (
    <DefaultRender
      className={clsx(
        { "line-through": context?.mode === "deleted" },
        className
      )}
    />
  );
}

function DiffValue({
  value,
  DefaultRender,
}: {
  value: unknown;
  DefaultRender: FC<{
    expandable?: boolean;
    value?: unknown;
    className?: string;
    style?: CSSProperties;
    context?: Record<string, any>;
  }>;
}) {
  const getTheme = useGetObjectViewerThemeOverride();

  function getOverrides({ textColor }: { textColor: ColorValue }) {
    return getTheme({
      typeNumber: textColor,
      typeBoolean: textColor,
      typeString: textColor,
      objectKey: textColor,
    });
  }

  if (value instanceof Added) {
    return (
      <DefaultRender
        className="bg-successSelected dark:bg-successSelected-dark"
        value={value.value}
        style={getOverrides({ textColor: text.success })}
      />
    );
  }

  if (value instanceof Deleted) {
    return (
      <DefaultRender
        className="bg-errorSelected dark:bg-errorSelected-dark"
        value={value.value}
        style={getOverrides({ textColor: text.error })}
        context={{ mode: "deleted" }}
      />
    );
  }

  if (value instanceof Changed) {
    return <DefaultRender expandable={false} />;
  }

  return <DefaultRender />;
}

function ChangedValue({
  value: changed,
  DefaultRender,
}: CustomRenderProps<Changed>) {
  return (
    <>
      <DefaultRender
        className="bg-errorSelected dark:bg-errorSelected-dark"
        value={changed.oldValue}
        context={{ mode: "deleted" }}
      />
      <span>{" => "}</span>
      <DefaultRender
        className="bg-successSelected dark:bg-successSelected-dark"
        value={changed.newValue}
      />
    </>
  );
}
