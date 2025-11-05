import { clsx } from "clsx";
import { customRenderable } from "./CustomRenderable";

interface ObjectKeyProps {
  className?: string;
  value: string;
}

export const ObjectKey = customRenderable(
  "objectKey",
  ({ className, value }: ObjectKeyProps) => (
    <span className={clsx("text-[var(--ov-objectKey-color)]", className)}>
      {value}
    </span>
  ),
  (parentProps, props: Omit<ObjectKeyProps, "value">) => ({
    ...parentProps,
    ...props,
    value: parentProps.value,
  })
);
