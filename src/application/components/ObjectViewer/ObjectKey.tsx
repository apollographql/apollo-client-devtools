import { clsx } from "clsx";
import { customRenderable } from "./CustomRenderable";
import { Fragment } from "react";

interface ObjectKeyProps {
  context?: Record<string, any>;
  className?: string;
  value: string;
  softWrapCharacters?: string[];
}

export const ObjectKey = customRenderable(
  "objectKey",
  ({ className, value, softWrapCharacters }: ObjectKeyProps) => {
    const uniqueChars = new Set(softWrapCharacters);
    const regex = softWrapCharacters
      ? new RegExp(`(${softWrapCharacters.join("|")})`)
      : null;

    return (
      <span className={clsx("text-[var(--ov-objectKey-color)]", className)}>
        {regex
          ? value.split(regex).map((part, idx) => (
              <Fragment key={idx}>
                {part}
                {uniqueChars.has(part) && <wbr />}
              </Fragment>
            ))
          : value}
      </span>
    );
  },
  (parentProps, props: Omit<ObjectKeyProps, "value">) => ({
    ...parentProps,
    ...props,
    value: parentProps.value,
  })
);
