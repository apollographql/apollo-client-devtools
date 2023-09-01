import { Fragment, useState } from "react";
import { gql, useQuery } from "@apollo/client";
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

const GET_MUTATIONS = gql`
  query GetMutations {
    mutationLog @client {
      mutations {
        id
        name
      }
    }
  }
`;

const GET_SELECTED_MUTATION = gql`
  query GetSelectedMutation($id: ID!) {
    mutation(id: $id) @client {
      id
      name
      mutationString
      variables
    }
  }
`;

export const Mutations = ({
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
  const { data } = useQuery(GET_MUTATIONS);
  const { data: selectedMutationData } = useQuery(GET_SELECTED_MUTATION, {
    variables: { id: selected },
    returnPartialData: true,
  });

  const shouldRender = !!data?.mutationLog?.mutations?.length;

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
          {data?.mutationLog?.mutations.map(({ name, id }) => {
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
              <h1 css={h1Styles}>{selectedMutationData?.mutation.name}</h1>
              <span css={operationNameStyles}>Mutation</span>
              <RunInExplorerButton
                operation={selectedMutationData?.mutation?.mutationString}
                variables={selectedMutationData?.mutation?.variables}
                embeddedExplorerIFrame={
                  embeddedExplorerProps.embeddedExplorerIFrame
                }
              />
            </Fragment>
          )}
        </SidebarLayout.Header>
        <SidebarLayout.Main>
          {shouldRender && (
            <MutationViewer
              mutationString={selectedMutationData?.mutation?.mutationString}
              variables={selectedMutationData?.mutation?.variables}
            />
          )}
        </SidebarLayout.Main>
      </SidebarLayout.Content>
    </SidebarLayout>
  );
};
