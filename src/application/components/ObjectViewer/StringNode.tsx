import clsx from "clsx";
import { customRenderable } from "./CustomRenderable";

export const StringNode = customRenderable<string>(
  "string",
  ({ className, value }) => {
    return (
      <span className={clsx("text-[var(--ov-typeString-color)]", className)}>
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
