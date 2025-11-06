import clsx from "clsx";

interface Props {
  className?: string;
  size: number;
}

export function ObjectSize({ className, size }: Props) {
  return (
    <span className={clsx("text-[var(--ov-info-color)]", className)}>
      {size} {size === 1 ? "item" : "items"}
    </span>
  );
}
