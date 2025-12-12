import { clsx } from "clsx";
import { customRenderable } from "./CustomRenderable";
import { Join } from "../Join";

interface ObjectKeyProps {
  context?: Record<string, any>;
  className?: string;
  value: string;
  softWrapCharacters?: string[];
}

export const ObjectKey = customRenderable(
  "objectKey",
  ({ className, value, softWrapCharacters }: ObjectKeyProps) => {
    const regex = softWrapCharacters
      ? new RegExp(`(${softWrapCharacters.join("|")})`)
      : null;

    return (
      <span className={clsx("text-[var(--ov-objectKey-color)]", className)}>
        {regex ? <Join delimeter={<wbr />}>{value.split(regex)}</Join> : value}
      </span>
    );
  },
  (parentProps, props: Omit<ObjectKeyProps, "value">) => ({
    ...parentProps,
    ...props,
    value: parentProps.value,
  })
);
