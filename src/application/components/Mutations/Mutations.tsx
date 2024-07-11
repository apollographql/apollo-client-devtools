import { useState } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { gql, useQuery } from "@apollo/client";
import { List } from "../List";
import { ListItem } from "../ListItem";
import IconErrorSolid from "@apollo/icons/default/IconErrorSolid.svg";

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
import { AlertDisclosure } from "../AlertDisclosure";
import { SerializedErrorAlertDisclosureItem } from "../SerializedErrorAlertDisclosureItem";
import { ApolloErrorAlertDisclosurePanel } from "../ApolloErrorAlertDisclosurePanel";

const GET_MUTATIONS: TypedDocumentNode<GetMutations, GetMutationsVariables> =
  gql`
    query GetMutations($id: ID!) {
      client(id: $id) {
        id
        mutations {
          total
          items {
            id
            name
            mutationString
            variables
            loading
            error {
              ... on SerializedError {
                ...SerializedErrorAlertDisclosureItem_error
              }
              ... on SerializedApolloError {
                ...ApolloErrorAlertDisclosurePanel_error
              }
            }
          }
        }
      }
    }

    ${ApolloErrorAlertDisclosurePanel.fragments.error}
    ${SerializedErrorAlertDisclosureItem.fragments.error}
  `;

interface MutationsProps {
  clientId: string | undefined;
  explorerIFrame: HTMLIFrameElement | null;
}

export const Mutations = ({ clientId, explorerIFrame }: MutationsProps) => {
  const [selected, setSelected] = useState<number>(0);
  const { data } = useQuery(GET_MUTATIONS, {
    variables: { id: clientId as string },
    skip: clientId == null,
    fetchPolicy: "cache-and-network",
    pollInterval: 500,
  });

  const mutations = data?.client.mutations?.items ?? [];
  const selectedMutation = mutations.find(
    (mutation) => Number(mutation.id) === selected
  );

  if (!selectedMutation && mutations.length > 0) {
    setSelected(0);
  }

  return (
    <SidebarLayout>
      <SidebarLayout.Sidebar>
        <List className="h-full">
          {mutations.map(({ name, id, loading, error }) => {
            return (
              <ListItem
                key={`${name}-${id}`}
                className="font-code"
                onClick={() => setSelected(Number(id))}
                selected={selected === Number(id)}
              >
                <div className="w-full flex items-center justify-between gap-2">
                  <span className="flex-1 overflow-hidden text-ellipsis">
                    {name}
                  </span>
                  {loading ? (
                    <Spinner size="xs" className="shrink-0" />
                  ) : error ? (
                    <IconErrorSolid className="size-4 text-icon-error dark:text-icon-error-dark" />
                  ) : null}
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
                {selectedMutation.loading ? (
                  <StatusBadge
                    color="blue"
                    variant="rounded"
                    icon={<Spinner size="xs" />}
                  >
                    Loading
                  </StatusBadge>
                ) : null}
              </QueryLayout.Title>
              <RunInExplorerButton
                operation={selectedMutation.mutationString}
                variables={selectedMutation.variables ?? undefined}
                embeddedExplorerIFrame={explorerIFrame}
              />
            </QueryLayout.Header>
            <QueryLayout.Content>
              {selectedMutation.error && (
                <AlertDisclosure className="mb-2" variant="error">
                  <AlertDisclosure.Button>
                    Mutation completed with errors
                  </AlertDisclosure.Button>
                  {selectedMutation.error.__typename ===
                  "SerializedApolloError" ? (
                    <ApolloErrorAlertDisclosurePanel
                      error={selectedMutation.error}
                    />
                  ) : (
                    <AlertDisclosure.Panel>
                      <ul>
                        <SerializedErrorAlertDisclosureItem
                          error={selectedMutation.error}
                        />
                      </ul>
                    </AlertDisclosure.Panel>
                  )}
                </AlertDisclosure>
              )}
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
