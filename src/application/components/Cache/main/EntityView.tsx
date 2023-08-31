import { css } from "@emotion/react";
import { JSONTree } from "react-json-tree";
import { rem } from "polished";

import { useTreeTheme } from "../../../theme";
import { ReactNode } from "react";

const cacheStyles = css`
  padding-top: 1rem;
  font-family: "Source Code Pro", monospace;
  font-size: ${rem(13)};

  > ul {
    margin-top: 0 !important;
    margin-left: ${rem(8)} !important;
  }
`;

const selectedStyles = css`
  background-color: yellow;
`;

export function EntityView({ cacheId, data, searchResults, setCacheId }) {
  const treeTheme = useTreeTheme();

  if (!data) return null;

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
        valueRenderer={(valueAsString: ReactNode, value, key) => {
          const matchFound = searchResult && searchResult[key] === value;

          return (
            <span
              css={css`
                ${matchFound ? selectedStyles : void 0}
                ${key === "__ref" &&
                css`
                  &:hover {
                    text-decoration: underline;
                    cursor: pointer;
                  }
                `}
              `}
              onClick={() => {
                if (key === "__ref") {
                  setCacheId(value);
                }
              }}
            >
              {valueAsString}
            </span>
          );
        }}
      />
    </div>
  );
}
