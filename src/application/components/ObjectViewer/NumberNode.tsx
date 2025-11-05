import { clsx } from "clsx";
import { customRenderableType } from "./CustomRenderable";
import type { ComponentPropsWithoutRef } from "react";
import type { RenderableTypeProps } from "./ObjectViewer";

interface NumberNodeProps
  extends ComponentPropsWithoutRef<"span">,
    RenderableTypeProps<number> {}

export const NumberNode = customRenderableType(
  "number",
  ({ className, value, path, context, ...rest }: NumberNodeProps) => {
    return (
      <span
        {...rest}
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
