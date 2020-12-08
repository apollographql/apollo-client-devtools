/** @jsx jsx */
import React from "react";
import { jsx, css } from "@emotion/core";
import JSONTree from "react-json-tree";
import { rem } from "polished";

// The Base16 options used below are explained here:
// https://github.com/chriskempson/base16/blob/7fa89d33bc77a43e1cf93c4654b235e21f827ce3/styling.md

const treeTheme = {
  scheme: "apollo",
  author: "Apollo (community@apollographql.com)",
  base00: "#FFFFFF",
  base01: "#FFFFFF",
  base02: "#FFFF00",
  base03: "#969896",
  base04: "#FFFFFF",
  base05: "#FFFFFF",
  base06: "#FFFFFF",
  base07: "#FFFFFF",
  base08: "#D13B3B",
  base09: "#D13B3B",
  base0A: "#191C23",
  base0B: "#D13B3B",
  base0C: "#191C23",
  base0D: "#191C23",
  base0E: "#191C23",
  base0F: "#191C23",
};

const cacheStyles = css`
  font-family: "Source Code Pro", monospace;
  font-size: ${rem(15)};

  > ul {
    margin-top: 0 !important;
    margin-left: ${rem(8)} !important;
  }
`;

const selectedStyles = css`
  background-color: yellow;
`;

export function EntityView({ cacheId, data, searchResults }) {
  const searchResult = searchResults[cacheId];
  return (
    <div css={cacheStyles}>
      {cacheId}
      <JSONTree
        data={data}
        theme={treeTheme}
        invertTheme={false}
        hideRoot={true}
        labelRenderer={([key]) => {
          const matchFound = searchResult && !!searchResult[key];
          return <span css={matchFound ? selectedStyles : void 0}>{key}:</span>;
        }}
        valueRenderer={(_, value, key) => {
          const matchFound = searchResult && searchResult[key] === value;
          return (
            <span css={matchFound ? selectedStyles : void 0}>{value}</span>
          );
        }}
      />
    </div>
  );
}
