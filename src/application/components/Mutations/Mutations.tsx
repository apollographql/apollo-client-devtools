import { Fragment, useState } from "react";
import { gql, TypedDocumentNode, useQuery } from "@apollo/client";
import { List } from "../List";
import { ListItem } from "../ListItem";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "../Queries/RunInExplorerButton";
import { GetMutations, GetMutationsVariables } from "../../types/gql";
import { CodeBlock } from "../CodeBlock";
import { JSONTreeViewer } from "../JSONTreeViewer";
import { Tabs } from "../Tabs";
import CopyToClipboard from "react-copy-to-clipboard";
import { Button } from "../Button";
import { CopyIcon } from "../icons/Copy";

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
            <div className="pt-3 grid [grid-template-columns:1fr_350px] gap-6">
              <div>
                <CodeBlock
                  className="overflow-y-hidden"
                  code={selectedMutation.mutationString}
                  language="graphql"
                />
              </div>
              <Tabs defaultValue="variables">
                <Tabs.List>
                  <Tabs.Trigger value="variables">Variables</Tabs.Trigger>
                  <CopyToClipboard
                    text={JSON.stringify(selectedMutation.variables)}
                  >
                    <Button
                      className="ml-auto"
                      size="sm"
                      variant="hidden"
                      data-testid="copy-mutation-variables"
                    >
                      <CopyIcon className="h-4" />
                    </Button>
                  </CopyToClipboard>
                </Tabs.List>
                <div className="mt-4 pb-4 text-sm">
                  <Tabs.Content value="variables">
                    <JSONTreeViewer
                      className="[&>li]:!pt-0"
                      data={selectedMutation.variables}
                    />
                  </Tabs.Content>
                </div>
              </Tabs>
            </div>
          </Fragment>
        )}
      </SidebarLayout.Main>
    </SidebarLayout>
  );
};
