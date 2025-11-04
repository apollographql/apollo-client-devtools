import { clsx } from "clsx";

interface Props {
  className?: string;
  value: bigint;
}

export function BigintNode({ className, value }: Props) {
  return (
    <span
      className={clsx(
        "text-[var(--ov-typeBigint-color,var(--ov-typeNumber-color))]",
        className
      )}
    >
      {String(value)}n
    </span>
  );
}
