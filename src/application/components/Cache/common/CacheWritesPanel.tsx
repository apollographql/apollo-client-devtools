import IconUnavailable from "@apollo/icons/default/IconUnavailable.svg";
import IconArrowLeft from "@apollo/icons/default/IconArrowLeft.svg";
import { fragmentRegistry } from "@/application/fragmentRegistry";
import type {
  CacheWritesListView_cacheWrites,
  CacheWriteView_cacheWrite,
  Client,
} from "@/application/types/gql";
import { type CacheWritesPanelFragment } from "@/application/types/gql";
import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import { useFragment } from "@apollo/client/react";
import { Panel } from "react-resizable-panels";
import { CodeBlock } from "../../CodeBlock";
import type { ReactNode } from "react";
import { useState } from "react";
import { getOperationName } from "@apollo/client/utilities/internal";
import { List } from "../../List";
import { ListItem } from "../../ListItem";
import { format } from "date-fns";
import { ObjectDiff } from "../../ObjectDiff";
import { ObjectViewer } from "../../ObjectViewer";
import { VariablesObject } from "../../VariablesObject";
import { Button } from "../../Button";
import { useApolloClient } from "@apollo/client/react";
import { Tooltip } from "../../Tooltip";

const CACHE_WRITES_PANEL_FRAGMENT: TypedDocumentNode<CacheWritesPanelFragment> = gql`
  fragment CacheWritesPanelFragment on CacheWrite {
    id
    ...CacheWritesListView_cacheWrites @nonreactive
    ...CacheWriteView_cacheWrite @nonreactive
  }
`;

fragmentRegistry.register(CACHE_WRITES_PANEL_FRAGMENT);

interface Props {
  client:
    | { __typename: "ClientV3" | "ClientV4"; id: string }
    | null
    | undefined;
  cacheWrites: Array<{ __typename: "CacheWrite"; id: string }>;
}

export function CacheWritesPanel({ client, cacheWrites }: Props) {
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

  return (
    <Panel
      id="cacheWrites"
      className="flex flex-col grow basis-1/2"
      minSize={10}
      defaultSize={25}
    >
      {selectedCacheWrite ? (
        <CacheWriteView
          cacheWrite={selectedCacheWrite}
          onNavigateBack={() => setSelectedId(null)}
        />
      ) : (
        <ListView client={client} cacheWrites={data} onSelect={setSelectedId} />
      )}
    </Panel>
  );
}

const LIST_VIEW_FRAGMENT: TypedDocumentNode<CacheWritesListView_cacheWrites> = gql`
  fragment CacheWritesListView_cacheWrites on CacheWrite {
    id
    document {
      ast
    }
    timestamp
  }
`;

fragmentRegistry.register(LIST_VIEW_FRAGMENT);

function ListView({
  client,
  cacheWrites,
  onSelect,
}: {
  client:
    | { __typename: "ClientV3" | "ClientV4"; id: string }
    | null
    | undefined;
  cacheWrites: CacheWritesListView_cacheWrites[];
  onSelect: (cacheWriteId: string) => void;
}) {
  const { data, complete } = useFragment({
    fragment: LIST_VIEW_FRAGMENT,
    from: cacheWrites,
  });
  const apolloClient = useApolloClient();

  if (!complete) {
    return null;
  }

  return (
    <div className="grow !overflow-auto">
      <section className="flex items-center justify-between border-b border-b-primary dark:border-b-primary-dark py-2 px-4">
        <h2 className="grow font-medium text-lg text-heading dark:text-heading-dark">
          Cache writes ({cacheWrites.length})
        </h2>
        <Tooltip content="Clear">
          <Button
            aria-label="Clear"
            size="sm"
            variant="hidden"
            onClick={() => {
              if (client) {
                apolloClient.cache.modify<Client>({
                  id: apolloClient.cache.identify(client),
                  fields: {
                    cacheWrites: () => [],
                  },
                });
              }
            }}
            icon={<IconUnavailable />}
          />
        </Tooltip>
      </section>
      <List className="p-4">
        {[...data].reverse().map((cacheWrite) => (
          <ListItem key={cacheWrite.id} onClick={() => onSelect(cacheWrite.id)}>
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
    </div>
  );
}

const CACHE_WRITE_VIEW: TypedDocumentNode<CacheWriteView_cacheWrite> = gql`
  fragment CacheWriteView_cacheWrite on CacheWrite {
    id
    data
    document {
      string
      ast
    }
    variables
    cacheDiff
    dataId
    broadcast
    overwrite
  }
`;

fragmentRegistry.register(CACHE_WRITE_VIEW);

function CacheWriteView({
  cacheWrite,
  onNavigateBack,
}: {
  cacheWrite: CacheWriteView_cacheWrite;
  onNavigateBack: () => void;
}) {
  const { data, complete } = useFragment({
    fragment: CACHE_WRITE_VIEW,
    from: cacheWrite,
  });

  if (!complete) {
    return null;
  }

  return (
    <div className="grow !overflow-auto">
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
        <h2 className="grow font-medium text-lg text-heading dark:text-heading-dark font-code">
          {getOperationName(data.document.ast, "(anonymous)")}
        </h2>
      </section>
      <div className="flex flex-col gap-4 p-4">
        <CodeBlock language="graphql" code={data.document.string} />
        <Section>
          <SectionTitle>Diff</SectionTitle>
          {data.cacheDiff === null ? (
            <span className="text-secondary dark:text-secondary-dark italic">
              Unchanged
            </span>
          ) : (
            <ObjectDiff diff={data.cacheDiff} />
          )}
        </Section>
        <Section>
          <SectionTitle>Data</SectionTitle>
          <ObjectViewer value={data.data} />
        </Section>
        <Section>
          <SectionTitle>Variables</SectionTitle>
          <VariablesObject variables={data.variables ?? undefined} />
        </Section>
        <Section>
          <SectionTitle>Options</SectionTitle>
          <ObjectViewer
            value={{
              dataId: data.dataId,
              overwrite: data.overwrite,
              broadcast: data.broadcast,
            }}
            displayObjectSize={false}
            collapsed={false}
          />
        </Section>
      </div>
    </div>
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
