/* eslint-disable @typescript-eslint/ban-types */
import clsx from "clsx";
import { customRenderableType } from "./CustomRenderable";

export const FunctionNode = customRenderableType<Function>(
  "function",
  ({ className, value }) => {
    return (
      <span className={clsx("text-[var(--ov-typeFunction-color)]", className)}>
        {value.toString()}
      </span>
    );
  }
);
