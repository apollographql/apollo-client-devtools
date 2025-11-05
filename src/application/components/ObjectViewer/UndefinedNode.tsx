import { clsx } from "clsx";
import {
  customRenderableType,
  filterForwardedElementProps,
} from "./CustomRenderable";
import type { ComponentPropsWithoutRef } from "react";
import type { RenderableTypeProps } from "./ObjectViewer";

interface UndefinedNodeProps
  extends ComponentPropsWithoutRef<"span">,
    RenderableTypeProps<never> {}

export const UndefinedNode = customRenderableType<never>(
  "undefined",
  ({ className, ...rest }: UndefinedNodeProps) => {
    return (
      <span
        {...filterForwardedElementProps<"span">(rest)}
        className={clsx("text-[var(--ov-typeUndefined-color)]", className)}
      >
        undefined
      </span>
    );
  }
);
