import { clsx } from "clsx";
import {
  customRenderableType,
  filterForwardedElementProps,
} from "./CustomRenderable";
import type { RenderableTypeProps } from "./ObjectViewer";
import type { ComponentPropsWithoutRef } from "react";

interface NullNodeProps
  extends ComponentPropsWithoutRef<"span">,
    RenderableTypeProps<never> {}

export const NullNode = customRenderableType<never>(
  "null",
  ({ className, ...rest }: NullNodeProps) => {
    return (
      <span
        {...filterForwardedElementProps<"span">(rest)}
        className={clsx("text-[var(--ov-typeNull-color)]", className)}
      >
        null
      </span>
    );
  }
);
