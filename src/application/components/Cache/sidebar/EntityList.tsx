import { List } from "../../List";
import { ListItem } from "../../ListItem";

import { getRootCacheIds } from "../common/utils";
import type { JSONObject } from "../../../types/json";
import HighlightMatch from "../../HighlightMatch";

interface EntityListProps {
  data: Record<string, JSONObject>;
  selectedCacheId: string;
  setCacheId: (cacheId: string) => void;
  searchTerm: string;
}

export function EntityList({
  data,
  selectedCacheId,
  setCacheId,
  searchTerm,
}: EntityListProps) {
  const ids = getRootCacheIds(data);

  return (
    <List>
      {ids.map((cacheId) => {
        return (
          <ListItem
            key={cacheId}
            onClick={() => setCacheId(cacheId)}
            selected={cacheId === selectedCacheId}
            className="font-code h-8 text-sm"
          >
            {searchTerm ? (
              <HighlightMatch searchTerm={searchTerm} value={cacheId} />
            ) : (
              cacheId
            )}
          </ListItem>
        );
      })}
    </List>
  );
}
