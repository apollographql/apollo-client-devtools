interface Props {
  value: string;
}

export function StringNode({ value }: Props) {
  return (
    <span className="text-[var(--ov-typeString-color)]">
      <Quote />
      {value}
      <Quote />
    </span>
  );
}

function Quote() {
  return (
    <span className="text-[var(--ov-quote-color,var(--ov-typeString-color))]">
      &quot;
    </span>
  );
}
