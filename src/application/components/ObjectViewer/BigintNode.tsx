import { clsx } from "clsx";
import {
  customRenderableType,
  filterForwardedElementProps,
} from "./CustomRenderable";
import type { ComponentPropsWithoutRef } from "react";
import type { RenderableTypeProps } from "./ObjectViewer";

interface BigintNodeProps
  extends ComponentPropsWithoutRef<"span">,
    RenderableTypeProps<bigint> {}

export const BigintNode = customRenderableType(
  "bigint",
  ({ className, value, ...rest }: BigintNodeProps) => {
    return (
      <span
        {...filterForwardedElementProps<"span">(rest)}
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
