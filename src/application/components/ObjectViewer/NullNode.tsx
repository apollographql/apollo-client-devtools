import { clsx } from "clsx";
import { customRenderableType } from "./CustomRenderable";

export const NullNode = customRenderableType<never>("null", ({ className }) => {
  return (
    <span className={clsx("text-[var(--ov-typeNull-color)]", className)}>
      null
    </span>
  );
});
