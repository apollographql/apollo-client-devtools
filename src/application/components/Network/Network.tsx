/** @jsxImportSource @emotion/react */
import { TypedDocumentNode, useQuery, gql } from "@apollo/client";
import { useMemo, useState } from "react";
import { List } from "@apollo/space-kit/List";
import { ListItem } from "@apollo/space-kit/ListItem";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { useTheme, useTreeTheme } from "../../theme";
import { GetNetwork, GetNetworkVariables } from "../../types/gql";
import { OperationViewer } from "./OperationViewer";
import { sidebarHeadingStyles, listStyles } from "../Queries/Queries";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { JSONTree } from "react-json-tree";

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
  const theme = useTheme();
  const treeTheme = useTreeTheme();
  const network = useMemo(
    () => (data?.network ? (JSON.parse(data.network) as Cache) : {}),
    [data?.network]
  );
  const [selectedOperation, setSelected] = useState<string>(
    network ? Object.keys(network)[0] : ""
  );
  const [selectedChunk, setSelectedChunk] = useState<string>("");

  return (
    <SidebarLayout navigationProps={navigationProps}>
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
                {network[operationName].operationName}
              </ListItem>
            );
          })}
        </List>
      </SidebarLayout.Sidebar>
      <SidebarLayout.Content>
        {/* <SidebarLayout.Header></SidebarLayout.Header> */}
        {Array.isArray(network[selectedOperation]?.data) ? (
          <PanelGroup direction="vertical" className="p-4">
            <Panel maxSize={75} style={{ overflow: "scroll" }}>
              <SidebarLayout.Main>
                <OperationViewer
                  selectedChunk={selectedChunk}
                  onChunkSelect={(name: string) => setSelectedChunk(name)}
                  operation={network[selectedOperation]}
                />
              </SidebarLayout.Main>
            </Panel>
            <PanelResizeHandle
              style={{
                border: "1px solid var(--mainBorder)",
              }}
            />
            <Panel maxSize={75} style={{ overflow: "scroll" }}>
              <SidebarLayout.Main>
                <div className="font-monospace text-xs">
                  {Array.isArray(network[selectedOperation]?.data) ? (
                    <JSONTree
                      shouldExpandNodeInitially={() => true}
                      data={network[selectedOperation]?.data.find(
                        ({ timestamp }) => timestamp === selectedChunk
                      )}
                      theme={treeTheme}
                      invertTheme={false}
                    />
                  ) : null}
                </div>
              </SidebarLayout.Main>
            </Panel>
          </PanelGroup>
        ) : (
          <SidebarLayout.Main>
            <OperationViewer
              onChunkSelect={(name: string) => setSelectedChunk(name)}
              operation={network[selectedOperation]}
            />
          </SidebarLayout.Main>
        )}
      </SidebarLayout.Content>
    </SidebarLayout>
  );
}
