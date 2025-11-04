interface Props {
  text: "[" | "]";
}

export function Bracket({ text }: Props) {
  return (
    <span className="inline-block align-middle text-[var(--ov-bracket-color,var(--ov-punctuation-color))]">
      {text}
    </span>
  );
}
