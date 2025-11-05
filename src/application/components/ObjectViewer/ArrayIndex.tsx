import clsx from "clsx";
import { customRenderable } from "./CustomRenderable";

interface ArrayIndexProps {
  className?: string;
  index: number;
}

export const ArrayIndex = customRenderable(
  "arrayIndex",
  ({ className, index }: ArrayIndexProps) => {
    return (
      <span
        className={clsx(
          "text-[var(--ov-arrayIndex-color,var(--ov-objectKey-color))]",
          className
        )}
      >
        {index}
      </span>
    );
  },
  (parentProps, props: Omit<ArrayIndexProps, "index">) => ({
    ...parentProps,
    ...props,
    index: parentProps.index,
  })
);
