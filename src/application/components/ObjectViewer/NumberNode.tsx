import { clsx } from "clsx";

interface Props {
  className?: string;
  value: number;
}

export function NumberNode({ className, value }: Props) {
  return (
    <span
      className={clsx(
        {
          "text-[var(--ov-typeInt-color,var(--ov-typeNumber-color))]":
            Number.isInteger(value),
          "text-[var(--ov-typeFloat-color,var(--ov-typeNumber-color))]":
            !Number.isInteger(value),
          "text-[var(--ov-typeNaN-color,var(--ov-typeNumber-color))]":
            Number.isNaN(value),
        },
        className
      )}
    >
      {value}
    </span>
  );
}
