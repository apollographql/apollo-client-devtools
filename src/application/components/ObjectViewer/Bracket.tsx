interface Props {
  type: "open" | "close";
  value: unknown;
}

export function Bracket({ type, value }: Props) {
  if (value === null || typeof value !== "object") {
    return null;
  }

  return (
    <span className="inline-block align-middle text-[var(--ov-bracket-color,var(--ov-punctuation-color))]">
      {type === "open" ? getOpenBracket(value) : getCloseBracket(value)}
    </span>
  );
}

const getOpenBracket = (value: object) => (Array.isArray(value) ? "[" : "{");
const getCloseBracket = (value: object) => (Array.isArray(value) ? "]" : "}");
