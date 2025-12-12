/* eslint-disable @typescript-eslint/ban-types */
import clsx from "clsx";
import {
  customRenderableType,
  filterForwardedElementProps,
} from "./CustomRenderable";
import type { ComponentPropsWithoutRef } from "react";
import type { RenderableTypeProps } from "./ObjectViewer";

interface FunctionNodeProps
  extends ComponentPropsWithoutRef<"span">,
    RenderableTypeProps<Function> {}

export const FunctionNode = customRenderableType(
  "function",
  ({ className, value, ...rest }: FunctionNodeProps) => {
    return (
      <span
        {...filterForwardedElementProps<"span">(rest)}
        className={clsx("text-[var(--ov-typeFunction-color)]", className)}
      >
        {value.toString()}
      </span>
    );
  }
);
