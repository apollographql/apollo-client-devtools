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
  selectedCacheId: string;
  setCacheId: (cacheId: string) => void;
}

export function EntityList({
  data,
  selectedCacheId,
  setCacheId,
}: EntityListProps) {
  const theme = useTheme();
  const ids = getRootCacheIds(data);

  return (
    <List
      css={listStyles}
      selectedColor={theme.sidebarSelected}
      hoverColor={theme.sidebarHover}
    >
      {ids.map((cacheId) => {
        return (
          <ListItem
            key={cacheId}
            onClick={() => setCacheId(cacheId)}
            selected={cacheId === selectedCacheId}
          >
            {cacheId}
          </ListItem>
        );
      })}
    </List>
  );
}
