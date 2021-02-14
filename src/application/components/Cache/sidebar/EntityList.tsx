/** @jsx jsx */

import React from "react";
import { jsx, css } from "@emotion/core";
import { List } from "@apollo/space-kit/List";
import { ListItem } from "@apollo/space-kit/ListItem";
import { colors } from "@apollo/space-kit/colors";
import { rem } from "polished";

import { useTheme } from "../../../theme";
import { getRootCacheIds } from "../common/utils";

const listStyles = css`
  font-family: monospace;
  color: ${colors.silver.lighter};

  > div {
    height: ${rem(32)};
    font-size: ${rem(13)};
  }
`;

export function EntityList({ data, cacheId, setCacheId, searchResults = {} }) {
  const theme = useTheme();
  const ids = getRootCacheIds(data);
  const idHits = Object.keys(searchResults);
  return (
    <List
      css={listStyles}
      selectedColor={theme.sidebarSelected}
      hoverColor={theme.sidebarHover}
    >
      {ids.map((listCacheId: string, index) => {
        return (
          <ListItem
            key={`${listCacheId}-${index}`}
            onClick={() => setCacheId(listCacheId)}
            selected={listCacheId === cacheId}
            highlighted={idHits.includes(listCacheId)}
          >
            {listCacheId}
          </ListItem>
        );
      })}
    </List>
  );
}
