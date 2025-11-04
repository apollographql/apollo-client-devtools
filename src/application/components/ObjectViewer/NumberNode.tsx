import { clsx } from "clsx";

interface Props {
  value: number;
}

export function NumberNode({ value }: Props) {
  return (
    <span
      className={clsx({
        "text-[var(--ov-typeInt-color,var(--ov-typeNumber-color))]":
          Number.isInteger(value),
        "text-[var(--ov-typeFloat-color,var(--ov-typeNumber-color))]":
          !Number.isInteger(value),
        "text-[var(--ov-typeNaN-color,var(--ov-typeNumber-color))]":
          Number.isNaN(value),
      })}
    >
      {value}
    </span>
  );
}
