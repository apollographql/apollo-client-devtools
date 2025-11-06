import clsx from "clsx";

interface Props {
  className?: string;
  length: number;
}

export function CollectionLength({ className, length }: Props) {
  return (
    <span className={clsx("text-[var(--ov-info-color)]", className)}>
      {length} {length === 1 ? "item" : "items"}
    </span>
  );
}
