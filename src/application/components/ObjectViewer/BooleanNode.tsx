import clsx from "clsx";
import {
  customRenderableType,
  filterForwardedElementProps,
} from "./CustomRenderable";
import type { ComponentPropsWithoutRef } from "react";
import type { RenderableTypeProps } from "./ObjectViewer";

interface BooleanNodeProps
  extends ComponentPropsWithoutRef<"span">,
    RenderableTypeProps<boolean> {}

export const BooleanNode = customRenderableType<boolean>(
  "boolean",
  ({ className, value, ...rest }: BooleanNodeProps) => {
    return (
      <span
        {...filterForwardedElementProps<"span">(rest)}
        className={clsx("text-[var(--ov-typeBoolean-color)]", className)}
      >
        {String(value)}
      </span>
    );
  }
);
