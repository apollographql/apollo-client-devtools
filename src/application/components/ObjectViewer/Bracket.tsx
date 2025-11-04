interface Props {
  text: "[" | "]";
}

export function Bracket({ text }: Props) {
  return (
    <span className="text-[var(--ov-bracket-color,var(--ov-punctuation-color))]">
      {text}
    </span>
  );
}
