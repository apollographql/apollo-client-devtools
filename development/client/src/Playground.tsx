import { gql } from "@apollo/client";
import { useApolloClient, useFragment } from "./ClientContext";
import React, { useState } from "react";

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

function WatchedColor({ hex }: { hex: string }) {
  useFragment({ fragment: FRAGMENT, from: { __typename: "Color", hex } });

  return <div>Watching Color:{hex}</div>;
}

export function Playground() {
  const client = useApolloClient();
  const [watchFragments, setWatchFragments] = useState(false);

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
      <div>
        <label>
          <input
            type="checkbox"
            checked={watchFragments}
            onChange={(e) => setWatchFragments(e.target.checked)}
          />
          Watch fragments
        </label>
        {watchFragments && (
          <>
            <WatchedColor hex="FF0000" />
            <WatchedColor hex="FF0000" />
            <WatchedColor hex="FF0000" />
            <WatchedColor hex="00FF00" />
          </>
        )}
      </div>
    </div>
  );
}
