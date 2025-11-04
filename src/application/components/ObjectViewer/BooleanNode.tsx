import clsx from "clsx";
import { customRenderable } from "./CustomRenderable";

export const BooleanNode = customRenderable<boolean>(
  "boolean",
  ({ className, value }) => {
    return (
      <span className={clsx("text-[var(--ov-typeBoolean-color)]", className)}>
        {String(value)}
      </span>
    );
  }
);
