import clsx from "clsx";
import { customRenderableType } from "./CustomRenderable";

export const BooleanNode = customRenderableType<boolean>(
  "boolean",
  ({ className, value }) => {
    return (
      <span className={clsx("text-[var(--ov-typeBoolean-color)]", className)}>
        {String(value)}
      </span>
    );
  }
);
