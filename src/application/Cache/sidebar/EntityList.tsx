/** @jsx jsx */
import React from "react";
import { jsx, css } from "@emotion/core";
import { useTheme } from "emotion-theming";
import { List } from "@apollo/space-kit/List";
import { ListItem } from "@apollo/space-kit/ListItem";
import { colors } from "@apollo/space-kit/colors";
import { rem } from "polished";

import { Theme } from "../../theme";
import { getRootCacheIds } from "../common/utils";

const listStyles = css`
  font-family: monospace;
  color: ${colors.silver.lighter};

  > div {
    height: ${rem(36)};
    font-size: ${rem(15)};
  }
`;

export function EntityList({ data, cacheId, setCacheId, searchResults = {} }) {
  const theme = useTheme<Theme>();
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
