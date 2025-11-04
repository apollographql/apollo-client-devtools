import { clsx } from "clsx";
import { customRenderable } from "./CustomRenderable";

export const UndefinedNode = customRenderable<never>(
  "undefined",
  ({ className }) => {
    return (
      <span className={clsx("text-[var(--ov-typeUndefined-color)]", className)}>
        undefined
      </span>
    );
  }
);
