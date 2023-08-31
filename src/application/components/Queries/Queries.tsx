import { Fragment, useState } from "react";
import { css } from "@emotion/react";
import { rem } from "polished";
import { gql, useQuery } from "@apollo/client";
import { List } from "@apollo/space-kit/List";
import { ListItem } from "@apollo/space-kit/ListItem";
import { colors } from "@apollo/space-kit/colors";

import { useTheme } from "../../theme";
import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "./RunInExplorerButton";
import { QueryViewer } from "./QueryViewer";

export const sidebarHeadingStyles = css`
  margin-left: ${rem(12)};
  text-transform: uppercase;
  font-size: ${rem(13)};
  font-weight: normal;
  letter-spacing: ${rem(1)};
  color: var(--whiteTransparent);
`;

export const h1Styles = css`
  font-family: monospace;
  font-weight: normal;
  font-size: ${rem(20)};
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

const GET_WATCHED_QUERIES = gql`
  query GetWatchedQueries {
    watchedQueries @client {
      queries {
        id
        name
      }
    }
  }
`;

const GET_WATCHED_QUERY = gql`
  query GetWatchedQuery($id: ID!) {
    watchedQuery(id: $id) @client {
      id
      name
      queryString
      variables
      cachedData
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
  const { data } = useQuery(GET_WATCHED_QUERIES);
  const { data: watchedQueryData } = useQuery(GET_WATCHED_QUERY, {
    variables: { id: selected },
    returnPartialData: true,
  });

  const shouldRender = !!data?.watchedQueries?.queries?.length;

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
          {data?.watchedQueries?.queries.map(({ name, id }) => {
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
          {shouldRender && (
            <Fragment>
              <h1 css={h1Styles}>{watchedQueryData?.watchedQuery?.name}</h1>
              <span css={operationNameStyles}>Query</span>
              <RunInExplorerButton
                operation={watchedQueryData?.watchedQuery?.queryString}
                variables={watchedQueryData?.watchedQuery?.variables}
                embeddedExplorerIFrame={
                  embeddedExplorerProps.embeddedExplorerIFrame
                }
              />
            </Fragment>
          )}
        </SidebarLayout.Header>
        <SidebarLayout.Main>
          {shouldRender && (
            <QueryViewer
              queryString={watchedQueryData?.watchedQuery?.queryString}
              variables={watchedQueryData?.watchedQuery?.variables}
              cachedData={watchedQueryData?.watchedQuery?.cachedData}
            />
          )}
        </SidebarLayout.Main>
      </SidebarLayout.Content>
    </SidebarLayout>
  );
};
