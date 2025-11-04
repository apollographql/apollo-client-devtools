interface Props {
  text: "{" | "}";
}

export function Brace({ text }: Props) {
  return (
    <span className="inline-block align-middle text-[var(--ov-brace-color,var(--ov-punctuation-color))]">
      {text}
    </span>
  );
}
