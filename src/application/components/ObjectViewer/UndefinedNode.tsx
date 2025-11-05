import { clsx } from "clsx";
import { customRenderableType } from "./CustomRenderable";

export const UndefinedNode = customRenderableType<never>(
  "undefined",
  ({ className }) => {
    return (
      <span className={clsx("text-[var(--ov-typeUndefined-color)]", className)}>
        undefined
      </span>
    );
  }
);
