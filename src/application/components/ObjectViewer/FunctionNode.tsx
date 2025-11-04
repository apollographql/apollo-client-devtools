/* eslint-disable @typescript-eslint/ban-types */
import clsx from "clsx";
import { customRenderable } from "./CustomRenderable";

export const FunctionNode = customRenderable<Function>(
  "function",
  ({ className, value }) => {
    return (
      <span className={clsx("text-[var(--ov-typeFunction-color)]", className)}>
        {value.toString()}
      </span>
    );
  }
);
