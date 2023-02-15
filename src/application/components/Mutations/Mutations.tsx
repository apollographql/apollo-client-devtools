/** @jsx jsx */

import { Fragment, useState } from "react";
import { jsx } from "@emotion/react";
import { gql, useQuery, useReactiveVar } from "@apollo/client";
import { List } from "@apollo/space-kit/List";
import { ListItem } from "@apollo/space-kit/ListItem";

import { useTheme } from "../../theme";
import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "../Queries/RunInExplorerButton";
import {
  sidebarHeadingStyles,
  h1Styles,
  operationNameStyles,
  listStyles,
} from "../Queries/Queries";
import { MutationViewer } from "./MutationViewer";
import { currentClient } from "../..";

const GET_MUTATIONS = gql`
  query GetMutations($clientId: ID!) {
    client(id: $clientId) {
      mutationLog {
        mutations {
          id
          name
        }
      }
    }
  }
`;

const GET_SELECTED_MUTATION = gql`
  query GetSelectedMutation($clientId: ID!, $id: ID!) {
    client(id: $clientId) {
      mutation(id: $id) @client {
        id
        name
        mutationString
        variables
      }
    }
  }
`;

export const Mutations = ({ navigationProps, embeddedExplorerProps }: {
  navigationProps: {
    queriesCount: number,
    mutationsCount: number,
  },
  embeddedExplorerProps: {
    embeddedExplorerIFrame: HTMLIFrameElement | null,
  }
}): jsx.JSX.Element => {
  const [selected, setSelected] = useState<number>(0);
  const selectedClient = useReactiveVar(currentClient)
  const theme = useTheme();
  const { data } = useQuery(GET_MUTATIONS, {
    variables: {
      clientId: selectedClient
    }
  });
  const { data: selectedMutationData } = useQuery(GET_SELECTED_MUTATION, {
    variables: { clientId: selectedClient, id: selected },
    returnPartialData: true,
  });

  const shouldRender = !!data?.client?.mutationLog?.mutations?.length;

  return (
    <SidebarLayout navigationProps={navigationProps}>
      <SidebarLayout.Sidebar navigationProps={navigationProps}>
        <h3 css={sidebarHeadingStyles}>
          Mutations ({navigationProps.mutationsCount})
        </h3>
        <List
          css={listStyles}
          selectedColor={theme.sidebarSelected}
          hoverColor={theme.sidebarHover}
        >
          {data?.client?.mutationLog?.mutations.map(({ name, id }) => {
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
              <h1 css={h1Styles}>{selectedMutationData?.client?.mutation?.name}</h1>
              <span css={operationNameStyles}>Mutation</span>
              <RunInExplorerButton
                operation={selectedMutationData?.client?.mutation?.mutationString}
                variables={selectedMutationData?.client?.mutation?.variables}
                embeddedExplorerIFrame={embeddedExplorerProps.embeddedExplorerIFrame}
              />
            </Fragment>
          )}
        </SidebarLayout.Header>
        <SidebarLayout.Main>
          {shouldRender && (
            <MutationViewer
              mutationString={selectedMutationData?.client?.mutation?.mutationString}
              variables={selectedMutationData?.client?.mutation?.variables}
            />
          )}
        </SidebarLayout.Main>
      </SidebarLayout.Content>
    </SidebarLayout>
  );
};
