interface HighlightMatchProps {
  searchTerm: string;
  value: string;
}

const HighlightMatch = ({ searchTerm, value }: HighlightMatchProps) => {
  if (!searchTerm) {
    return <>{value}</>;
  }

  const escapedSearchTerm = RegExp.escape(searchTerm);

  let regex: RegExp;

  try {
    regex = new RegExp(escapedSearchTerm, "i");
  } catch {
    return <>{value}</>;
  }

  const match = regex.exec(value);

  if (!match) {
    return <>{value}</>;
  }

  return (
    <span>
      {value.slice(0, match.index)}
      <span className="bg-searchHighlight dark:bg-searchHighlight-dark text-inverted dark:text-inverted-dark">
        {match[0]}
      </span>
      {value.slice(match.index + match[0].length)}
    </span>
  );
};

export default HighlightMatch;