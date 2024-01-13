import { Fragment, useState } from "react";
import { gql, TypedDocumentNode, useQuery } from "@apollo/client";
import { List } from "../List";
import { ListItem } from "../ListItem";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "../Queries/RunInExplorerButton";
import { GetMutations, GetMutationsVariables } from "../../types/gql";
import { JSONTreeViewer } from "../JSONTreeViewer";
import { Tabs } from "../Tabs";
import { QueryLayout } from "../QueryLayout";
import { CopyButton } from "../CopyButton";

const GET_MUTATIONS: TypedDocumentNode<GetMutations, GetMutationsVariables> =
  gql`
    query GetMutations {
      mutationLog @client {
        mutations {
          id
          name
          mutationString
          variables
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
          {mutations.map(({ name, id }) => {
            return (
              <ListItem
                key={`${name}-${id}`}
                className="font-code h-8 text-sm"
                onClick={() => setSelected(id)}
                selected={selected === id}
              >
                {name}
              </ListItem>
            );
          })}
        </List>
      </SidebarLayout.Sidebar>
      <QueryLayout>
        {selectedMutation ? (
          <>
            <QueryLayout.Header>
              <QueryLayout.Title>{selectedMutation.name}</QueryLayout.Title>
              <RunInExplorerButton
                operation={selectedMutation.mutationString}
                variables={selectedMutation.variables ?? undefined}
                embeddedExplorerIFrame={explorerIFrame}
              />
            </QueryLayout.Header>
            <QueryLayout.QueryString code={selectedMutation.mutationString} />
          </>
        ) : (
          <QueryLayout.EmptyMessage className="m-auto mt-20" />
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
              className="[&>li]:!pt-0"
              data={selectedMutation?.variables ?? {}}
            />
          </QueryLayout.TabContent>
        </QueryLayout.Tabs>
      </QueryLayout>
    </SidebarLayout>
  );
};
