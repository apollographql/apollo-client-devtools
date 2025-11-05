import { clsx } from "clsx";
import { customRenderable } from "./CustomRenderable";

interface ObjectKeyProps {
  className?: string;
  objectKey: string;
}

export const ObjectKey = customRenderable(
  "objectKey",
  ({ className, objectKey }: ObjectKeyProps) => (
    <span className={clsx("text-[var(--ov-objectKey-color)]", className)}>
      {objectKey}
    </span>
  ),
  (parentProps, props: Omit<ObjectKeyProps, "objectKey">) => ({
    ...parentProps,
    ...props,
    objectKey: parentProps.objectKey,
  })
);
