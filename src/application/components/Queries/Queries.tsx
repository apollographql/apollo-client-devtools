import { Fragment, useState } from "react";
import { gql, useQuery, TypedDocumentNode } from "@apollo/client";
import { List } from "../List";
import { ListItem } from "../ListItem";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "./RunInExplorerButton";
import { QueryViewer } from "./QueryViewer";
import { GetWatchedQueries, GetWatchedQueriesVariables } from "../../types/gql";

const GET_WATCHED_QUERIES: TypedDocumentNode<
  GetWatchedQueries,
  GetWatchedQueriesVariables
> = gql`
  query GetWatchedQueries {
    watchedQueries @client {
      queries {
        id
        name
        queryString
        variables
        ...QueryViewer_query
      }
    }
  }
`;

interface QueriesProps {
  embeddedExplorerProps: {
    embeddedExplorerIFrame: HTMLIFrameElement | null;
  };
}

export const Queries = ({ embeddedExplorerProps }: QueriesProps) => {
  const [selected, setSelected] = useState<number>(0);
  const { data } = useQuery(GET_WATCHED_QUERIES, { returnPartialData: true });

  const queries = data?.watchedQueries.queries ?? [];
  const selectedQuery = queries.find((query) => query.id === selected);

  return (
    <SidebarLayout>
      <SidebarLayout.Sidebar>
        <List>
          {queries.map(({ name, id }) => {
            return (
              <ListItem
                key={`${name}-${id}`}
                onClick={() => setSelected(id)}
                selected={selected === id}
                className="font-code h-8 text-sm"
              >
                {name}
              </ListItem>
            );
          })}
        </List>
      </SidebarLayout.Sidebar>
      <SidebarLayout.Main>
        {selectedQuery && (
          <Fragment>
            <h1 className="prose-xl text-heading dark:text-heading-dark">
              <code>{selectedQuery.name}</code>
            </h1>
            <RunInExplorerButton
              operation={selectedQuery.queryString}
              variables={selectedQuery.variables ?? undefined}
              embeddedExplorerIFrame={
                embeddedExplorerProps.embeddedExplorerIFrame
              }
            />
            <QueryViewer query={selectedQuery} />
          </Fragment>
        )}
      </SidebarLayout.Main>
    </SidebarLayout>
  );
};
