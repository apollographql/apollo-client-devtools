import type { ComponentPropsWithoutRef } from "react";
import { customRenderable } from "./CustomRenderable";
import type { Path } from "./types";
import { ArrayIndex } from "./ArrayIndex";
import { AnyValueNode } from "./AnyValueNode";
import { Punctuation } from "./Punctuation";
import { ObjectKeyLabel } from "./ObjectKeyLabel";
import { ArrayValue } from "./ArrayValue";
import { ObjectValue } from "./ObjectValue";

interface ArrayItemProps extends ComponentPropsWithoutRef<"div"> {
  context: Record<string, any> | undefined;
  collapsible?: boolean;
  depth: number;
  index: number;
  value: unknown;
  path: Path;
}

export const ArrayItem = customRenderable(
  "arrayItem",
  (props: ArrayItemProps) => {
    const { collapsible, value, index, ...rest } = props;

    if (Array.isArray(value)) {
      return (
        <ArrayValue {...rest} collapsible={collapsible} value={value}>
          <ArrayIndex context={props.context} index={index} />
        </ArrayValue>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <ObjectValue {...rest} collapsible={collapsible} value={value}>
          <ArrayIndex context={props.context} index={index} />
        </ObjectValue>
      );
    }

    return (
      <div {...rest}>
        <ObjectKeyLabel collapsible={false}>
          <ArrayIndex context={props.context} index={index} />
        </ObjectKeyLabel>{" "}
        <AnyValueNode className="align-middle" {...props} />
        <Punctuation>,</Punctuation>
      </div>
    );
  },
  (parentProps, props: Partial<Omit<ArrayItemProps, "depth">>) => ({
    ...parentProps,
    ...props,
    path: parentProps.path,
    depth: parentProps.depth,
  })
);
