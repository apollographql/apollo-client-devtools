/** @jsx jsx */
import React from "react";
import { IconSearch } from "@apollo/space-kit/icons/IconSearch";
import { TextField } from "@apollo/space-kit/TextField";
import { colors } from "@apollo/space-kit/colors";
import { jsx, css } from "@emotion/core";
import { rem } from "polished";

import { objectFilter } from "../common/utils";

const searchIconStyles = {
  height: 16,
  width: 16,
  color: "rgba(255, 255, 255, .3)",
};

const textFieldStyles = css`
  border-bottom: ${rem(1)} solid rgba(255, 255, 255, 0.3);
  margin-bottom: ${rem(20)};

  input {
    background: none;
    border: none;
    color: ${colors.grey.lighter};

    ::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  }
`;

export function Search({
  data,
  setSearchResults,
}: {
  data: Record<string, any>;
  setSearchResults: (results: Record<string, any>) => void;
}) {
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
      icon={<IconSearch style={searchIconStyles} />}
      className="search-input"
      placeholder="Search queries"
      onChange={performSearch}
      size="small"
    />
  );
}
