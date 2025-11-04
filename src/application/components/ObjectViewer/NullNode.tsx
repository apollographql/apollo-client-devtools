import { clsx } from "clsx";
import { customRenderable } from "./CustomRenderable";

export const NullNode = customRenderable<never>("null", ({ className }) => {
  return (
    <span className={clsx("text-[var(--ov-typeNull-color)]", className)}>
      null
    </span>
  );
});
