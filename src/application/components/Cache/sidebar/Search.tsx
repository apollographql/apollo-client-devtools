import React from "react";
import { IconSearch } from "@apollo/space-kit/icons/IconSearch";
import { TextField } from "@apollo/space-kit/TextField";
import { colors } from "@apollo/space-kit/colors";
import { css } from "@emotion/react";
import { rem } from "polished";

import { objectFilter } from "../common/utils";
import { useTheme, Theme } from "../../../theme";

const searchIconStyles = (theme: Theme) => ({
  height: 16,
  width: 16,
  color: theme.whiteTransparent,
});

const textFieldStyles = css`
  border-bottom: ${rem(1)} solid var(--whiteTransparent);
  margin-bottom: ${rem(10)};

  > label > div {
    margin-top: ${rem(4)};
  }

  > div {
    margin-top: ${rem(4)};
    margin-bottom: ${rem(4)};
  }

  input {
    background: none;
    border: none;
    color: ${colors.grey.lighter};

    ::placeholder {
      color: var(--whiteTransparent);
    }
  }
`;

interface SearchProps {
  data: Record<string, any>;
  setSearchResults: (results: Record<string, any>) => void;
}

export const Search: React.FC<SearchProps> = ({ data, setSearchResults }) => {
  const theme = useTheme();

  function performSearch(event) {
    const keywords = event.target.value;
    if (keywords.trim() === "") {
      setSearchResults({});
    }

    if (keywords.length >= 3) {
      const searchResults: Record<string, any> = {};
      Object.keys(data).forEach((dataId) => {
        const results = objectFilter(data[dataId], keywords);
        if (results) searchResults[dataId] = results;
      });
      setSearchResults(searchResults);
    }
  }

  return (
    <TextField
      css={textFieldStyles}
      icon={<IconSearch style={searchIconStyles(theme)} />}
      className="search-input"
      placeholder="Search queries"
      onChange={performSearch}
      size="small"
    />
  );
};
