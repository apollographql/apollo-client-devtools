/** @jsxImportSource @emotion/react */
import { TypedDocumentNode, useQuery, gql } from "@apollo/client";
import { useMemo, useState } from "react";
import { List } from "@apollo/space-kit/List";
import { ListItem } from "@apollo/space-kit/ListItem";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { useTheme } from "../../theme";
import { GetNetwork, GetNetworkVariables } from "../../types/gql";
import { OperationViewer } from "./OperationViewer";
import {
  sidebarHeadingStyles,
  operationNameStyles,
  listStyles,
} from "../Queries/Queries";

const GET_NETWORK: TypedDocumentNode<GetNetwork, GetNetworkVariables> = gql`
  query GetNetwork {
    network @client
  }
`;

export function Network({
  navigationProps,
}: {
  navigationProps: {
    queriesCount: number;
    mutationsCount: number;
  };
}) {
  const { data } = useQuery(GET_NETWORK);
  console.log({ data });
  const theme = useTheme();
  const [selectedOperation, setSelected] = useState<string>("");
  const network = useMemo(
    () => (data?.network ? (JSON.parse(data.network) as Cache) : {}),
    [data?.network]
  );
  console.log(network[selectedOperation]);
  return (
    // @ts-ignore-next-line
    <SidebarLayout navigationProps={navigationProps}>
      {/* @ts-ignore-next-line */}
      <SidebarLayout.Sidebar navigationProps={navigationProps}>
        <h3 css={sidebarHeadingStyles}>Network</h3>
        <List
          css={listStyles}
          selectedColor={theme.sidebarSelected}
          hoverColor={theme.sidebarHover}
        >
          {Object.keys(network).map((operationName) => {
            return (
              <ListItem
                key={`${name}-${operationName}`}
                onClick={() => setSelected(operationName)}
                selected={selectedOperation === operationName}
              >
                {operationName}
              </ListItem>
            );
          })}
        </List>
      </SidebarLayout.Sidebar>
      <SidebarLayout.Content>
        <SidebarLayout.Header>
          {/* {selectedMutation && (
            <Fragment>
              <h1 className="font-normal font-monospace text-xl">
                <code>{selectedMutation.name}</code>
              </h1>
              <span css={operationNameStyles}>Mutation</span>
              <RunInExplorerButton
                operation={selectedMutation.mutationString}
                variables={selectedMutation.variables ?? undefined}
                embeddedExplorerIFrame={
                  embeddedExplorerProps.embeddedExplorerIFrame
                }
              />
            </Fragment>
          )} */}
        </SidebarLayout.Header>
        <SidebarLayout.Main>
          {selectedOperation && (
            <OperationViewer operation={network[selectedOperation]} />
          )}
        </SidebarLayout.Main>
      </SidebarLayout.Content>
    </SidebarLayout>
  );
}
