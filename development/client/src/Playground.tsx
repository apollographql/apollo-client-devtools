import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import React from "react";

const FRAGMENT = gql`
  fragment SingleColorFragment on Color {
    name
    hex
  }
`;

const NESTED_FRAGMENT = gql`
  fragment SingleColorNestedFragment on Color {
    hex
    ...HexName
  }

  fragment HexName on Color {
    name
  }
`;

export function Playground() {
  const client = useApolloClient();

  return (
    <div>
      <div>
        <button
          onClick={() => {
            client.writeFragment({
              fragment: FRAGMENT,
              data: { __typename: "Color", name: "Test Red", hex: "FF0000" },
            });
          }}
        >
          Write fragment
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            client.writeFragment({
              fragment: NESTED_FRAGMENT,
              fragmentName: "SingleColorNestedFragment",
              data: { __typename: "Color", name: "Test Red", hex: "FF0000" },
            });
          }}
        >
          Write nested fragment
        </button>
      </div>
    </div>
  );
}
