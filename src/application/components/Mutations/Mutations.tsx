import { Fragment, useState } from "react";
import { gql, TypedDocumentNode, useQuery } from "@apollo/client";
import { List } from "../List";
import { ListItem } from "../ListItem";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "../Queries/RunInExplorerButton";
import { MutationViewer } from "./MutationViewer";
import { GetMutations, GetMutationsVariables } from "../../types/gql";

const GET_MUTATIONS: TypedDocumentNode<GetMutations, GetMutationsVariables> =
  gql`
    query GetMutations {
      mutationLog @client {
        mutations {
          id
          name
          mutationString
          variables
          ...MutationViewer_mutation
        }
      }
    }
  `;

interface MutationsProps {
  embeddedExplorerProps: {
    embeddedExplorerIFrame: HTMLIFrameElement | null;
  };
}

export const Mutations = ({ embeddedExplorerProps }: MutationsProps) => {
  const [selected, setSelected] = useState<number>(0);
  const { data } = useQuery(GET_MUTATIONS);

  const mutations = data?.mutationLog.mutations ?? [];
  const selectedMutation = mutations.find(
    (mutation) => mutation.id === selected
  );

  return (
    <SidebarLayout>
      <SidebarLayout.Sidebar>
        <List>
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
      <SidebarLayout.Main>
        {selectedMutation && (
          <Fragment>
            <h1 className="prose-xl text-heading dark:text-heading-dark">
              <code>{selectedMutation.name}</code>
            </h1>
            <RunInExplorerButton
              operation={selectedMutation.mutationString}
              variables={selectedMutation.variables ?? undefined}
              embeddedExplorerIFrame={
                embeddedExplorerProps.embeddedExplorerIFrame
              }
            />
          </Fragment>
        )}
        {selectedMutation && <MutationViewer mutation={selectedMutation} />}
      </SidebarLayout.Main>
    </SidebarLayout>
  );
};
