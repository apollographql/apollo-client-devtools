import type { ComponentPropsWithoutRef } from "react";
import { customRenderable } from "./CustomRenderable";
import type { Path } from "./types";
import { ObjectKey } from "./ObjectKey";
import { AnyValue } from "./AnyValue";
import { Punctuation } from "./Punctuation";
import { ObjectKeyLabel } from "./ObjectKeyLabel";
import { ArrayValue } from "./ArrayValue";
import { ObjectValue } from "./ObjectValue";
import { useContextValueFallback } from "./context";

interface ObjectPairProps extends ComponentPropsWithoutRef<"div"> {
  context: Record<string, any> | undefined;
  depth: number;
  displayObjectSize?: boolean;
  collapsible?: boolean;
  objectKey: string;
  value: unknown;
  path: Path;
}

export const ObjectPair = customRenderable(
  "objectPair",
  ({ displayObjectSize, ...props }: ObjectPairProps) => {
    const { collapsible, value, objectKey, ...rest } = props;
    const displayObjectSizeSetting = useContextValueFallback(
      "displayObjectSize",
      displayObjectSize
    );

    if (Array.isArray(value)) {
      return (
        <ArrayValue
          {...rest}
          collapsible={collapsible}
          displayObjectSize={displayObjectSizeSetting}
          value={value}
        >
          <ObjectKey context={props.context} value={objectKey} />
        </ArrayValue>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <ObjectValue
          {...rest}
          collapsible={collapsible}
          displayObjectSize={displayObjectSizeSetting}
          value={value}
        >
          <ObjectKey context={props.context} value={objectKey} />
        </ObjectValue>
      );
    }

    return (
      <div {...rest}>
        <ObjectKeyLabel collapsible={false}>
          <ObjectKey context={props.context} value={objectKey} />
        </ObjectKeyLabel>{" "}
        <AnyValue className="align-middle" {...props} />
        <Punctuation>,</Punctuation>
      </div>
    );
  },
  (parentProps, props: Partial<Omit<ObjectPairProps, "depth" | "path">>) => ({
    ...parentProps,
    ...props,
    depth: parentProps.depth,
  })
);
