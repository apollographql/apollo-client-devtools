import clsx from "clsx";

interface Props {
  label?: string;
  pluralLabel?: string;
  className?: string;
  size: number;
}

export function ObjectSize({
  label = "item",
  pluralLabel = `${label}s`,
  className,
  size,
}: Props) {
  return (
    <span className={clsx("text-[var(--ov-info-color)]", className)}>
      {size} {size === 1 ? label : pluralLabel}
    </span>
  );
}
