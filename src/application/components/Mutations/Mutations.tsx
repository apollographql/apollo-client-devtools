import { useState } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { gql, useQuery } from "@apollo/client";
import { List } from "../List";
import { ListItem } from "../ListItem";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "../Queries/RunInExplorerButton";
import type { GetMutations, GetMutationsVariables } from "../../types/gql";
import { JSONTreeViewer } from "../JSONTreeViewer";
import { Tabs } from "../Tabs";
import { QueryLayout } from "../QueryLayout";
import { CopyButton } from "../CopyButton";
import { EmptyMessage } from "../EmptyMessage";
import { isEmpty } from "../../utilities/isEmpty";
import { Spinner } from "../Spinner";
import { StatusBadge } from "../StatusBadge";

const GET_MUTATIONS: TypedDocumentNode<GetMutations, GetMutationsVariables> =
  gql`
    query GetMutations {
      mutationLog @client {
        mutations {
          id
          name
          mutationString
          variables
          loading
        }
      }
    }
  `;

interface MutationsProps {
  explorerIFrame: HTMLIFrameElement | null;
}

export const Mutations = ({ explorerIFrame }: MutationsProps) => {
  const [selected, setSelected] = useState<number>(0);
  const { data } = useQuery(GET_MUTATIONS);

  const mutations = data?.mutationLog.mutations ?? [];
  const selectedMutation = mutations.find(
    (mutation) => mutation.id === selected
  );

  return (
    <SidebarLayout>
      <SidebarLayout.Sidebar>
        <List className="h-full">
          {mutations.map(({ name, id, loading }) => {
            return (
              <ListItem
                key={`${name}-${id}`}
                className="font-code"
                onClick={() => setSelected(id)}
                selected={selected === id}
              >
                <div className="w-full flex items-center justify-between">
                  {name}
                  {loading && <Spinner size="xs" />}
                </div>
              </ListItem>
            );
          })}
        </List>
      </SidebarLayout.Sidebar>
      <QueryLayout>
        {selectedMutation ? (
          <>
            <QueryLayout.Header>
              <QueryLayout.Title className="flex gap-6 items-center">
                {selectedMutation.name}
                {selectedMutation.loading && (
                  <StatusBadge
                    color="blue"
                    variant="rounded"
                    icon={<Spinner size="xs" />}
                  >
                    Loading
                  </StatusBadge>
                )}
              </QueryLayout.Title>
              <RunInExplorerButton
                operation={selectedMutation.mutationString}
                variables={selectedMutation.variables ?? undefined}
                embeddedExplorerIFrame={explorerIFrame}
              />
            </QueryLayout.Header>
            <QueryLayout.Content>
              <QueryLayout.QueryString code={selectedMutation.mutationString} />
            </QueryLayout.Content>
          </>
        ) : (
          <EmptyMessage className="m-auto mt-20" />
        )}
        <QueryLayout.Tabs defaultValue="variables">
          <Tabs.List>
            <Tabs.Trigger value="variables">Variables</Tabs.Trigger>
            <CopyButton
              text={JSON.stringify(selectedMutation?.variables ?? {})}
              size="sm"
              className="ml-auto relative right-[6px]"
            />
          </Tabs.List>
          <QueryLayout.TabContent value="variables">
            <JSONTreeViewer
              hideRoot={!isEmpty(selectedMutation?.variables)}
              className="[&>li]:!pt-0"
              data={selectedMutation?.variables ?? {}}
            />
          </QueryLayout.TabContent>
        </QueryLayout.Tabs>
      </QueryLayout>
    </SidebarLayout>
  );
};
