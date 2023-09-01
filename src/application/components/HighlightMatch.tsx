import { css } from "@emotion/react";
import { colors } from "@apollo/space-kit/colors";

interface HighlightMatchProps {
  searchTerm: string;
  value: string;
}

const HighlightMatch = ({ searchTerm, value }: HighlightMatchProps) => {
  const regex = new RegExp(searchTerm, "i");
  const match = regex.exec(value);

  if (!match) {
    return <>{value}</>;
  }

  return (
    <>
      {value.slice(0, match.index)}
      <span
        css={css`
          color: ${colors.grey.darker};
          background: ${colors.yellow.base};
        `}
      >
        {match[0]}
      </span>
      {value.slice(match.index + searchTerm.length)}
    </>
  );
};

export default HighlightMatch;
