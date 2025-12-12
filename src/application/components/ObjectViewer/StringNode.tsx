import clsx from "clsx";
import {
  customRenderableType,
  filterForwardedElementProps,
} from "./CustomRenderable";
import type { ComponentPropsWithoutRef } from "react";
import type { RenderableTypeProps } from "./ObjectViewer";

interface StringNodeProps
  extends ComponentPropsWithoutRef<"span">,
    RenderableTypeProps<string> {}

export const StringNode = customRenderableType(
  "string",
  ({ className, value, ...rest }: StringNodeProps) => {
    return (
      <span
        {...filterForwardedElementProps<"span">(rest)}
        className={clsx("text-[var(--ov-typeString-color)]", className)}
      >
        <Quote />
        {value}
        <Quote />
      </span>
    );
  }
);

function Quote() {
  return (
    <span className="text-[var(--ov-quote-color,var(--ov-typeString-color))]">
      &quot;
    </span>
  );
}
