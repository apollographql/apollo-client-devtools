import type { ComponentPropsWithoutRef } from "react";
import { customRenderable } from "./CustomRenderable";
import type { Path } from "./types";
import { ObjectKey } from "./ObjectKey";
import { AnyValueNode } from "./AnyValueNode";
import { Punctuation } from "./Punctuation";
import { ObjectKeyLabel } from "./ObjectKeyLabel";
import { ArrayValue } from "./ArrayValue";
import { ObjectValue } from "./ObjectValue";

interface ObjectPairProps extends ComponentPropsWithoutRef<"div"> {
  context: Record<string, any> | undefined;
  depth: number;
  collapsible?: boolean;
  objectKey: string;
  value: unknown;
  path: Path;
}

export const ObjectPair = customRenderable(
  "objectPair",
  (props: ObjectPairProps) => {
    const { collapsible, value, objectKey, ...rest } = props;

    if (Array.isArray(value)) {
      return (
        <ArrayValue {...rest} collapsible={collapsible} value={value}>
          <ObjectKey context={props.context} value={objectKey} />
        </ArrayValue>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <ObjectValue {...rest} collapsible={collapsible} value={value}>
          <ObjectKey context={props.context} value={objectKey} />
        </ObjectValue>
      );
    }

    return (
      <div {...rest}>
        <ObjectKeyLabel collapsible={false}>
          <ObjectKey context={props.context} value={objectKey} />
        </ObjectKeyLabel>{" "}
        <AnyValueNode className="align-middle" {...props} />
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
