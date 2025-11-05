import clsx from "clsx";
import { customRenderableType } from "./CustomRenderable";
import type { ComponentPropsWithoutRef } from "react";

interface StringNodeProps extends ComponentPropsWithoutRef<"span"> {
  className?: string;
  value: string;
}

export const StringNode = customRenderableType(
  "string",
  ({ className, value, ...rest }: StringNodeProps) => {
    return (
      <span
        className={clsx("text-[var(--ov-typeString-color)]", className)}
        {...rest}
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
