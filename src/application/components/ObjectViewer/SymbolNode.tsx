import clsx from "clsx";
import { customRenderableType } from "./CustomRenderable";

export const SymbolNode = customRenderableType<symbol>(
  "symbol",
  ({ className, value }) => {
    return (
      <span className={clsx("text-[var(--ov-typeSymbol-color)]", className)}>
        {value.toString()}
      </span>
    );
  }
);
