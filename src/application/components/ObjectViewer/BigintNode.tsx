import { clsx } from "clsx";
import { customRenderable } from "./CustomRenderable";

export const BigintNode = customRenderable<bigint>(
  "bigint",
  ({ className, value }) => {
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
);
