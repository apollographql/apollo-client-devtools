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
    <span>
      {value.slice(0, match.index)}
      <span className="bg-searchHighlight dark:bg-searchHighlight-dark text-inverted dark:text-inverted-dark">
        {match[0]}
      </span>
      {value.slice(match.index + searchTerm.length)}
    </span>
  );
};

export default HighlightMatch;
