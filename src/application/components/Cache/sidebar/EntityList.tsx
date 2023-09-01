import { css } from "@emotion/react";
import { List } from "@apollo/space-kit/List";
import { ListItem } from "@apollo/space-kit/ListItem";
import { colors } from "@apollo/space-kit/colors";
import { rem } from "polished";

import { useTheme } from "../../../theme";
import { getRootCacheIds } from "../common/utils";
import { JSONObject } from "../../../types/json";

const listStyles = css`
  font-family: monospace;
  color: ${colors.silver.lighter};

  > div {
    height: ${rem(32)};
    font-size: ${rem(13)};
  }
`;

interface EntityListProps {
  data: Record<string, JSONObject>;
  cacheId: string;
  setCacheId: (cacheId: string) => void;
  searchResults: unknown;
}

export function EntityList({
  data,
  cacheId,
  setCacheId,
  searchResults = {},
}: EntityListProps) {
  const theme = useTheme();
  const ids = getRootCacheIds(data);
  const idHits = Object.keys(searchResults);
  return (
    <List
      css={listStyles}
      selectedColor={theme.sidebarSelected}
      hoverColor={theme.sidebarHover}
    >
      {ids.map((listCacheId, index) => {
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
