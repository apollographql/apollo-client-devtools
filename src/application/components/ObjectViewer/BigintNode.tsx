import { clsx } from "clsx";
import { customRenderableType } from "./CustomRenderable";

export const BigintNode = customRenderableType<bigint>(
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
