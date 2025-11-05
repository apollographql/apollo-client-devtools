import { clsx } from "clsx";
import { customRenderableType } from "./CustomRenderable";

export const NumberNode = customRenderableType<number>(
  "number",
  ({ className, value }) => {
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
);
