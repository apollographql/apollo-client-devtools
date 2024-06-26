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
import { ErrorAlertDisclosureItem } from "../ErrorAlertDisclosureItem";

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
          error {
            message
            name
            stack
          }
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
          {mutations.map(({ name, id, loading, error }) => {
            return (
              <ListItem
                key={`${name}-${id}`}
                className="font-code"
                onClick={() => setSelected(id)}
                selected={selected === id}
              >
                <div className="w-full flex items-center justify-between">
                  {name}
                  {loading ? (
                    <Spinner size="xs" />
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
                  <AlertDisclosure.Panel>
                    <ul className="flex flex-col gap-4">
                      <ErrorAlertDisclosureItem>
                        <div>
                          {selectedMutation.error.name}:{" "}
                          {selectedMutation.error.message}
                        </div>
                        {selectedMutation.error.stack && (
                          <div className="mt-3">
                            <JSONTreeViewer
                              key={selectedMutation.id}
                              className="text-xs"
                              data={selectedMutation.error.stack
                                .split("\n")
                                .slice(1)}
                              keyPath={["Stack trace"]}
                              theme="alertError"
                              shouldExpandNodeInitially={() => false}
                            />
                          </div>
                        )}
                      </ErrorAlertDisclosureItem>
                    </ul>
                  </AlertDisclosure.Panel>
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
