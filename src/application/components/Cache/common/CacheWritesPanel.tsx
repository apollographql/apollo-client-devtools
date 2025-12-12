import IconUnavailable from "@apollo/icons/default/IconUnavailable.svg";
import IconArrowLeft from "@apollo/icons/default/IconArrowLeft.svg";
import { fragmentRegistry } from "@/application/fragmentRegistry";
import type {
  CacheModifyView_cacheWrite,
  CacheWritesListView_cacheWrites,
  Client,
  DirectCacheWriteView_cacheWrite,
  WriteFragmentView_cacheWrite,
  WriteQueryView_cacheWrite,
} from "@/application/types/gql";
import { type CacheWritesPanelFragment } from "@/application/types/gql";
import type { DocumentNode, TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { useFragment } from "@apollo/client/react";
import { Panel } from "react-resizable-panels";
import { CodeBlock } from "../../CodeBlock";
import type { ReactNode } from "react";
import { Fragment, memo, useState } from "react";
import { print } from "@apollo/client/utilities";
import { getOperationName } from "@apollo/client/utilities/internal";
import { List } from "../../List";
import { ListItem } from "../../ListItem";
import { ObjectDiff } from "../../ObjectDiff";
import { ObjectViewer } from "../../ObjectViewer";
import { Button } from "../../Button";
import { useApolloClient } from "@apollo/client/react";
import { Tooltip } from "../../Tooltip";
import type { Diff } from "@/application/utilities/diff";
import type { CacheModifyOptions } from "@/application/types/scalars";
import { DirectCacheWriteListItem } from "../../DirectCacheWriteListItem";
import { WriteQueryListItem } from "../../WriteQueryListItem";
import { WriteFragmentListItem } from "../../WriteFragmentListItem";
import { CacheModifyListItem } from "../../CacheModifyListItem";
import { Kind } from "graphql";
import { RecordButton } from "../../RecordButton";
import { RecordIcon } from "../../RecordIcon";

const CACHE_WRITES_PANEL_FRAGMENT: TypedDocumentNode<CacheWritesPanelFragment> = gql`
  fragment CacheWritesPanelFragment on CacheWrite {
    id
    ...DirectCacheWriteView_cacheWrite @nonreactive
    ...WriteFragmentView_cacheWrite @nonreactive
    ...WriteQueryView_cacheWrite @nonreactive
    ...CacheModifyView_cacheWrite @nonreactive
    ...CacheWritesListView_cacheWrites @nonreactive
  }
`;

fragmentRegistry.register(CACHE_WRITES_PANEL_FRAGMENT);

interface Props {
  client:
    | { __typename: "ClientV3" | "ClientV4"; id: string }
    | null
    | undefined;
  cacheWrites: Array<CacheWritesPanelFragment>;
  isRecording: boolean;
  onToggleRecord: () => void;
}

export const CacheWritesPanel = memo(
  ({ client, cacheWrites, isRecording, onToggleRecord }: Props) => {
    const { data, complete } = useFragment({
      fragment: CACHE_WRITES_PANEL_FRAGMENT,
      fragmentName: "CacheWritesPanelFragment",
      from: cacheWrites,
    });

    const [selectedId, setSelectedId] = useState<string | null>(null);

    if (!complete) {
      return null;
    }

    const selectedCacheWrite = data.find(
      (cacheWrite) => cacheWrite.id === selectedId
    );

    const navigateBack = () => setSelectedId(null);

    return (
      <Panel
        id="cacheWrites"
        className="flex flex-col grow basis-1/2"
        minSize={10}
        defaultSize={25}
      >
        {selectedCacheWrite?.__typename === "DirectCacheWrite" ? (
          <DirectCacheWriteView
            cacheWrite={selectedCacheWrite}
            onNavigateBack={navigateBack}
          />
        ) : selectedCacheWrite?.__typename === "WriteFragmentCacheWrite" ? (
          <WriteFragmentView
            cacheWrite={selectedCacheWrite}
            onNavigateBack={navigateBack}
          />
        ) : selectedCacheWrite?.__typename === "CacheModifyWrite" ? (
          <CacheModifyView
            cacheWrite={selectedCacheWrite}
            onNavigateBack={navigateBack}
          />
        ) : selectedCacheWrite ? (
          <WriteQueryView
            cacheWrite={selectedCacheWrite}
            onNavigateBack={navigateBack}
          />
        ) : (
          <ListView
            client={client}
            cacheWrites={data}
            onSelect={setSelectedId}
            isRecording={isRecording}
            onToggleRecord={onToggleRecord}
          />
        )}
      </Panel>
    );
  }
);

const LIST_VIEW_FRAGMENT: TypedDocumentNode<CacheWritesListView_cacheWrites> = gql`
  fragment CacheWritesListView_cacheWrites on CacheWrite {
    id
    ...CacheModifyListItem_cacheWrite
    ...DirectCacheWriteListItem_cacheWrite
    ...WriteQueryListItem_cacheWrite
    ...WriteFragmentListItem_cacheWrite
  }
`;

fragmentRegistry.register(LIST_VIEW_FRAGMENT);

function ListView({
  client,
  cacheWrites,
  isRecording,
  onSelect,
  onToggleRecord,
}: {
  client:
    | { __typename: "ClientV3" | "ClientV4"; id: string }
    | null
    | undefined;
  cacheWrites: CacheWritesListView_cacheWrites[];
  onSelect: (cacheWriteId: string) => void;
  isRecording: boolean;
  onToggleRecord: () => void;
}) {
  const { data, complete } = useFragment({
    fragment: LIST_VIEW_FRAGMENT,
    fragmentName: "CacheWritesListView_cacheWrites",
    from: cacheWrites,
  });
  const apolloClient = useApolloClient();

  if (!complete) {
    return null;
  }

  const sortedCacheWrites = [...data].reverse();

  return (
    <div className="flex flex-col grow !overflow-auto">
      <section className="flex items-center justify-between border-b border-b-primary dark:border-b-primary-dark py-2 px-4">
        <h2 className="grow font-medium text-md text-heading dark:text-heading-dark">
          Cache writes ({cacheWrites.length})
        </h2>
        <div className="flex items-center gap-2">
          <RecordButton
            isRecording={isRecording}
            onClick={onToggleRecord}
            size="sm"
          />
          <Tooltip content="Clear">
            <Button
              aria-label="Clear"
              size="sm"
              variant="hidden"
              onClick={() => {
                const { cache } = apolloClient;

                if (client) {
                  cache.modify<Client>({
                    id: cache.identify(client),
                    fields: {
                      cacheWrites: () => [],
                    },
                  });
                }
              }}
              icon={<IconUnavailable />}
            />
          </Tooltip>
        </div>
      </section>
      <List className="p-4">
        {sortedCacheWrites.length > 0 ? (
          sortedCacheWrites.map((cacheWrite) => {
            return (
              <ListItem
                key={cacheWrite.id}
                onClick={() => onSelect(cacheWrite.id)}
              >
                {cacheWrite.__typename === "DirectCacheWrite" ? (
                  <DirectCacheWriteListItem cacheWrite={cacheWrite} />
                ) : cacheWrite.__typename === "WriteQueryCacheWrite" ? (
                  <WriteQueryListItem cacheWrite={cacheWrite} />
                ) : cacheWrite.__typename === "WriteFragmentCacheWrite" ? (
                  <WriteFragmentListItem cacheWrite={cacheWrite} />
                ) : (
                  <CacheModifyListItem cacheWrite={cacheWrite} />
                )}
              </ListItem>
            );
          })
        ) : (
          <EmptyList isRecording={isRecording} />
        )}
      </List>
    </div>
  );
}

function EmptyList({ isRecording }: { isRecording: boolean }) {
  return (
    <div className="flex justify-center items-center mt-20">
      <div className="text-left">
        {!isRecording && (
          <>
            Press record{" "}
            <RecordIcon className="inline-block size-4 relative -top-0.5" /> to
            start listening for cache writes.
          </>
        )}
      </div>
    </div>
  );
}

const CACHE_MODIFY_VIEW: TypedDocumentNode<CacheModifyView_cacheWrite> = gql`
  fragment CacheModifyView_cacheWrite on CacheModifyWrite {
    id
    diff
    modifyOptions: options
  }
`;

fragmentRegistry.register(CACHE_MODIFY_VIEW);

function CacheModifyView({
  cacheWrite,
  onNavigateBack,
}: {
  cacheWrite: CacheModifyView_cacheWrite;
  onNavigateBack: () => void;
}) {
  const { data, complete } = useFragment({
    fragment: CACHE_MODIFY_VIEW,
    from: cacheWrite,
  });

  if (!complete) {
    return null;
  }

  const { diff, modifyOptions } = data;

  return (
    <CacheWriteContainer>
      <CacheWriteHeader
        title={modifyOptions.id ?? "(unknown)"}
        onNavigateBack={onNavigateBack}
      />
      <CacheWriteScrollArea>
        <Section>
          <SectionTitle>Diff</SectionTitle>
          {diff === null ? (
            <span className="text-secondary dark:text-secondary-dark italic">
              Unchanged
            </span>
          ) : (
            <ObjectDiff diff={diff} />
          )}
        </Section>
        <Section>
          <SectionTitle>Options</SectionTitle>
          <ModifyOptions options={modifyOptions} />
        </Section>
      </CacheWriteScrollArea>
    </CacheWriteContainer>
  );
}

function ModifyOptions({ options }: { options: CacheModifyOptions }) {
  return (
    <div>
      <span className="font-code inline-block align-bottom">
        cache<span className="text-code-a dark:text-code-a-dark">.</span>
        <span className="text-code-e dark:text-code-e-dark">modify</span>(
      </span>
      <ObjectViewer
        value={options}
        displayObjectSize={false}
        collapsed={false}
        tagName="span"
        builtinRenderers={{
          string: ({ context, value, DefaultRender }) => {
            if (context?.option === "fields") {
              return (
                <span className="text-[var(--ov-typeFunction-color)]">
                  {value}
                </span>
              );
            }

            return <DefaultRender />;
          },
          objectPair: ({ objectKey, DefaultRender }) => {
            if (objectKey === "fields") {
              return <DefaultRender context={{ option: objectKey }} />;
            }

            return <DefaultRender />;
          },
        }}
      />
      <span className="font-code inline-block align-bottom">)</span>
    </div>
  );
}

const DIRECT_CACHE_WRITE_VIEW: TypedDocumentNode<DirectCacheWriteView_cacheWrite> = gql`
  fragment DirectCacheWriteView_cacheWrite on DirectCacheWrite {
    id
    diff
    writeOptions: options
  }
`;

fragmentRegistry.register(DIRECT_CACHE_WRITE_VIEW);

function DirectCacheWriteView({
  cacheWrite,
  onNavigateBack,
}: {
  cacheWrite: DirectCacheWriteView_cacheWrite;
  onNavigateBack: () => void;
}) {
  const { data, complete } = useFragment({
    fragment: DIRECT_CACHE_WRITE_VIEW,
    from: cacheWrite,
  });

  if (!complete) {
    return null;
  }

  const { query, result, variables } = data.writeOptions;

  return (
    <CacheWriteContainer>
      <CacheWriteHeader
        title={getOperationName(query, "(anonymous)")}
        onNavigateBack={onNavigateBack}
      />
      <CacheWriteScrollArea>
        <CodeBlock
          className="shrink-0 max-h-96"
          language="graphql"
          code={print(query)}
        />
        <DiffSection diff={data.diff} />
        <OptionsSection
          api="cache.write"
          document={query}
          collapsed={({ value, defaultCollapsed }) =>
            value === variables || value === result ? false : defaultCollapsed
          }
          options={data.writeOptions}
        />
      </CacheWriteScrollArea>
    </CacheWriteContainer>
  );
}

const WRITE_FRAGMENT_VIEW: TypedDocumentNode<WriteFragmentView_cacheWrite> = gql`
  fragment WriteFragmentView_cacheWrite on WriteFragmentCacheWrite {
    id
    diff
    writeFragmentOptions: options
  }
`;

fragmentRegistry.register(WRITE_FRAGMENT_VIEW);

function WriteFragmentView({
  cacheWrite,
  onNavigateBack,
}: {
  cacheWrite: WriteFragmentView_cacheWrite;
  onNavigateBack: () => void;
}) {
  const { data, complete } = useFragment({
    fragment: WRITE_FRAGMENT_VIEW,
    from: cacheWrite,
  });

  if (!complete) {
    return null;
  }

  const {
    fragment,
    fragmentName,
    data: result,
    variables,
  } = data.writeFragmentOptions;

  const fragments = fragment.definitions.filter(
    (ast) => ast.kind === Kind.FRAGMENT_DEFINITION
  );

  return (
    <CacheWriteContainer>
      <CacheWriteHeader
        title={fragmentName ?? fragments[0].name.value}
        onNavigateBack={onNavigateBack}
      />
      <CacheWriteScrollArea>
        <CodeBlock
          className="shrink-0 max-h-96"
          language="graphql"
          code={print(fragment)}
        />
        <DiffSection diff={data.diff} />
        <OptionsSection
          api="cache.writeFragment"
          document={fragment}
          collapsed={({ value, defaultCollapsed }) =>
            value === variables || value === result ? false : defaultCollapsed
          }
          options={data.writeFragmentOptions}
        />
      </CacheWriteScrollArea>
    </CacheWriteContainer>
  );
}

const WRITE_QUERY_VIEW: TypedDocumentNode<WriteQueryView_cacheWrite> = gql`
  fragment WriteQueryView_cacheWrite on WriteQueryCacheWrite {
    id
    diff
    writeQueryOptions: options
  }
`;

fragmentRegistry.register(WRITE_QUERY_VIEW);

function WriteQueryView({
  cacheWrite,
  onNavigateBack,
}: {
  cacheWrite: WriteQueryView_cacheWrite;
  onNavigateBack: () => void;
}) {
  const { data, complete } = useFragment({
    fragment: WRITE_QUERY_VIEW,
    from: cacheWrite,
  });

  if (!complete) {
    return null;
  }

  const { query, data: result, variables } = data.writeQueryOptions;

  return (
    <CacheWriteContainer>
      <CacheWriteHeader
        title={getOperationName(query, "(anonymous)")}
        onNavigateBack={onNavigateBack}
      />
      <CacheWriteScrollArea>
        <CodeBlock
          className="shrink-0 max-h-96"
          language="graphql"
          code={print(query)}
        />
        <DiffSection diff={data.diff} />
        <OptionsSection
          api="cache.writeQuery"
          document={query}
          collapsed={({ value, defaultCollapsed }) =>
            value === variables || value === result ? false : defaultCollapsed
          }
          options={data.writeQueryOptions}
        />
      </CacheWriteScrollArea>
    </CacheWriteContainer>
  );
}

function Section({ children }: { children?: ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

function SectionTitle({ children }: { children?: ReactNode }) {
  return (
    <h3 className="text-md text-heading dark:text-heading-dark">{children}</h3>
  );
}

function CacheWriteContainer({ children }: { children: ReactNode }) {
  return <div className="grow overflow-hidden flex flex-col">{children}</div>;
}

function CacheWriteHeader({
  title,
  onNavigateBack,
}: {
  title: string;
  onNavigateBack: () => void;
}) {
  return (
    <section className="flex items-center gap-2 border-b border-b-primary dark:border-b-primary-dark py-2 px-4">
      <Tooltip content="Back">
        <Button
          aria-label="Back"
          variant="hidden"
          size="sm"
          icon={<IconArrowLeft />}
          onClick={onNavigateBack}
        />
      </Tooltip>
      <h2 className="grow font-medium text-md text-heading dark:text-heading-dark font-code">
        {title}
      </h2>
    </section>
  );
}

function CacheWriteScrollArea({ children }: { children: ReactNode }) {
  return (
    <div className="grow overflow-auto flex flex-col gap-4 p-4">{children}</div>
  );
}

function DiffSection({ diff }: { diff: Diff | null }) {
  return (
    <Section>
      <SectionTitle>Diff</SectionTitle>
      {diff === null ? (
        <span className="text-secondary dark:text-secondary-dark italic">
          Unchanged
        </span>
      ) : (
        <ObjectDiff diff={diff} />
      )}
    </Section>
  );
}

function OptionsSection({
  api,
  collapsed,
  document,
  options,
}: {
  api: string;
  collapsed?: (options: {
    value: unknown;
    defaultCollapsed: boolean;
  }) => boolean;
  document: DocumentNode;
  options: unknown;
}) {
  return (
    <Section>
      <SectionTitle>Options</SectionTitle>
      <div>
        <span className="font-code inline-block align-bottom">
          {api?.split(".").map((part, idx, arr) =>
            idx === arr.length - 1 ? (
              <span key={idx} className="text-code-e dark:text-code-e-dark">
                {part}
              </span>
            ) : (
              <Fragment key={idx}>
                <span>{part}</span>
                <span>.</span>
              </Fragment>
            )
          )}
          (
        </span>
        <ObjectViewer
          value={options}
          displayObjectSize={false}
          tagName="span"
          collapsed={collapsed}
          builtinRenderers={{
            array: ({ depth, DefaultRender }) => {
              return <DefaultRender displayObjectSize={depth > 1} />;
            },
            objectValue: ({
              collapsed,
              depth,
              value,
              onToggleCollapsed,
              DefaultRender,
            }) => {
              if (value === document) {
                const documentString = print(document);

                return (
                  <>
                    <span className="inline-block align-middle">
                      <span className="text-code-d dark:text-code-d-dark">
                        gql
                      </span>
                      <span>`</span>
                    </span>
                    {collapsed ? (
                      <span
                        onClick={onToggleCollapsed}
                        className="text-code-a dark:text-code-a-dark cursor-pointer"
                      >
                        ...
                      </span>
                    ) : (
                      <CodeBlock
                        language="graphql"
                        code={documentString}
                        className="![background:none] !border-none !text-md !p-0 !pl-[3ch]"
                        copyable={false}
                      />
                    )}
                    <span>`</span>
                  </>
                );
              }

              return <DefaultRender displayObjectSize={depth > 1} />;
            },
            arrayValue: ({ depth, DefaultRender }) => {
              return <DefaultRender displayObjectSize={depth > 1} />;
            },
          }}
        />
        <span className="font-code inline-block align-bottom">)</span>
      </div>
    </Section>
  );
}
