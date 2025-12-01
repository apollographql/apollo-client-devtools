import clsx from "clsx";
import {
  customRenderableType,
  filterForwardedElementProps,
} from "./CustomRenderable";
import type { ComponentPropsWithoutRef } from "react";
import type { RenderableTypeProps } from "./ObjectViewer";

interface SymbolNodeProps
  extends ComponentPropsWithoutRef<"span">,
    RenderableTypeProps<symbol> {}

export const SymbolNode = customRenderableType(
  "symbol",
  ({ className, value, ...rest }: SymbolNodeProps) => {
    return (
      <span
        {...filterForwardedElementProps<"span">(rest)}
        className={clsx("text-[var(--ov-typeSymbol-color)]", className)}
      >
        {value.toString()}
      </span>
    );
  }
);
