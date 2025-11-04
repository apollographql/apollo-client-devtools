import clsx from "clsx";

interface Props {
  className?: string;
  value: string;
}

export function StringNode({ className, value }: Props) {
  return (
    <span className={clsx("text-[var(--ov-typeString-color)]", className)}>
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
