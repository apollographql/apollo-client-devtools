import clsx from "clsx";
import { customRenderable } from "./CustomRenderable";

export const SymbolNode = customRenderable<symbol>(
  "symbol",
  ({ className, value }) => {
    return (
      <span className={clsx("text-[var(--ov-typeSymbol-color)]", className)}>
        {value.toString()}
      </span>
    );
  }
);
