import { IconSearch } from "@apollo/space-kit/icons/IconSearch";
import { TextField } from "@apollo/space-kit/TextField";
import { colors } from "@apollo/space-kit/colors";
import { css } from "@emotion/react";
import { rem } from "polished";

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
  value: string;
  onChange: (value: string) => void;
}

export const Search = ({ onChange, value }: SearchProps) => {
  const theme = useTheme();

  return (
    <TextField
      css={textFieldStyles}
      icon={<IconSearch style={searchIconStyles(theme)} />}
      className="search-input"
      placeholder="Search queries"
      onChange={(e) => onChange(e.target.value)}
      size="small"
      value={value}
    />
  );
};
