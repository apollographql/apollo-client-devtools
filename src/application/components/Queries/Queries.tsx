/** @jsxImportSource @emotion/react */
import { Fragment, useState } from "react";
import { css } from "@emotion/react";
import { rem } from "polished";
import { gql, useQuery, TypedDocumentNode } from "@apollo/client";
import { List } from "@apollo/space-kit/List";
import { ListItem } from "@apollo/space-kit/ListItem";
import { colors } from "@apollo/space-kit/colors";

import { useTheme } from "../../theme";
import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "./RunInExplorerButton";
import { QueryViewer } from "./QueryViewer";
import { GetWatchedQueries, GetWatchedQueriesVariables } from "../../types/gql";

export const sidebarHeadingStyles = css`
  margin-left: ${rem(12)};
  text-transform: uppercase;
  font-size: ${rem(13)};
  font-weight: normal;
  letter-spacing: ${rem(1)};
  color: var(--whiteTransparent);
  padding: ${rem(8)} 0;
`;

export const operationNameStyles = css`
  margin: ${rem(3)} 0 0 ${rem(8)};
  font-family: "Source Sans Pro", sans-serif;
  color: ${colors.grey.light};
  text-transform: uppercase;
  font-size: ${rem(11)};
`;

export const listStyles = css`
  grid-area: list;
  font-family: monospace;
  color: ${colors.silver.lighter};

  > div {
    height: ${rem(32)};
    font-size: ${rem(13)};
  }
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
  const theme = useTheme();
  const { data } = useQuery(GET_WATCHED_QUERIES, { returnPartialData: true });

  const queries = data?.watchedQueries.queries ?? [];
  const selectedQuery = queries.find((query) => query.id === selected);

  return (
    <SidebarLayout navigationProps={navigationProps}>
      <SidebarLayout.Sidebar navigationProps={navigationProps}>
        <h3 css={sidebarHeadingStyles}>
          Active Queries ({navigationProps.queriesCount})
        </h3>
        <List
          css={listStyles}
          selectedColor={theme.sidebarSelected}
          hoverColor={theme.sidebarHover}
        >
          {queries.map(({ name, id }) => {
            return (
              <ListItem
                key={`${name}-${id}`}
                onClick={() => setSelected(id)}
                selected={selected === id}
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
              <h1 className="font-normal font-monospace text-xl">
                <code>{selectedQuery.name}</code>
              </h1>
              <span css={operationNameStyles}>Query</span>
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
