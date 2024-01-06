/** @jsxImportSource @emotion/react */
import { Fragment, useState } from "react";
import { css } from "@emotion/react";
import { rem } from "polished";
import { gql, useQuery, TypedDocumentNode } from "@apollo/client";
import { List } from "../List";
import { ListItem } from "../ListItem";
import { colors } from "@apollo/space-kit/colors";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "./RunInExplorerButton";
import { QueryViewer } from "./QueryViewer";
import { GetWatchedQueries, GetWatchedQueriesVariables } from "../../types/gql";

export const operationNameStyles = css`
  margin: ${rem(3)} 0 0 ${rem(8)};
  font-family: "Source Sans Pro", sans-serif;
  color: ${colors.grey.light};
  text-transform: uppercase;
  font-size: ${rem(11)};
`;

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

export const Queries = ({
  navigationProps,
  embeddedExplorerProps,
}: {
  navigationProps: {
    queriesCount: number;
    mutationsCount: number;
  };
  embeddedExplorerProps: {
    embeddedExplorerIFrame: HTMLIFrameElement | null;
  };
}): JSX.Element => {
  const [selected, setSelected] = useState<number>(0);
  const { data } = useQuery(GET_WATCHED_QUERIES, { returnPartialData: true });

  const queries = data?.watchedQueries.queries ?? [];
  const selectedQuery = queries.find((query) => query.id === selected);

  return (
    <SidebarLayout navigationProps={navigationProps}>
      <SidebarLayout.Sidebar navigationProps={navigationProps}>
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
      <SidebarLayout.Content>
        <SidebarLayout.Header>
          {selectedQuery && (
            <Fragment>
              <div className="flex items-center gap-2">
                <h1 className="prose-xl">
                  <code>{selectedQuery.name}</code>
                </h1>
                <span className="uppercase text-xs text-info dark:text-info-dark">
                  Query
                </span>
              </div>
              <RunInExplorerButton
                operation={selectedQuery.queryString}
                variables={selectedQuery.variables ?? undefined}
                embeddedExplorerIFrame={
                  embeddedExplorerProps.embeddedExplorerIFrame
                }
              />
            </Fragment>
          )}
        </SidebarLayout.Header>
        <SidebarLayout.Main>
          {selectedQuery && <QueryViewer query={selectedQuery} />}
        </SidebarLayout.Main>
      </SidebarLayout.Content>
    </SidebarLayout>
  );
};
