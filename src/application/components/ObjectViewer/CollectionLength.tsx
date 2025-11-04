import clsx from "clsx";

interface Props {
  className?: string;
  value: any[] | object;
}

export function CollectionLength({ className, value }: Props) {
  const length = Array.isArray(value)
    ? value.length
    : Object.keys(value).length;

  return (
    <span className={clsx("text-[var(--ov-info-color)]", className)}>
      {length} {length === 1 ? "item" : "items"}
    </span>
  );
}
