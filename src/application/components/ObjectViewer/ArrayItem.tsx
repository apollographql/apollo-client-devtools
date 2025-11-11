import type { ComponentPropsWithoutRef } from "react";
import { customRenderable } from "./CustomRenderable";
import type { Path } from "./types";
import { ArrayIndex } from "./ArrayIndex";
import { AnyValue } from "./AnyValue";
import { Punctuation } from "./Punctuation";
import { ObjectKeyLabel } from "./ObjectKeyLabel";
import { ArrayValue } from "./ArrayValue";
import { ObjectValue } from "./ObjectValue";
import type { RenderableTypeProps } from "./ObjectViewer";

interface ArrayItemProps
  extends ComponentPropsWithoutRef<"div">,
    RenderableTypeProps<unknown> {
  collapsible?: boolean;
  index: number;
}

export const ArrayItem = customRenderable(
  "arrayItem",
  (props: ArrayItemProps) => {
    const { value, index, ...rest } = props;

    if (Array.isArray(value)) {
      return (
        <ArrayValue {...rest} value={value}>
          <ArrayIndex context={props.context} index={index} />
        </ArrayValue>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <ObjectValue {...rest} value={value}>
          <ArrayIndex context={props.context} index={index} />
        </ObjectValue>
      );
    }

    return (
      <div {...rest}>
        <ObjectKeyLabel collapsible={false}>
          <ArrayIndex context={props.context} index={index} />
        </ObjectKeyLabel>{" "}
        <AnyValue className="align-middle" {...props} />
        <Punctuation>,</Punctuation>
      </div>
    );
  },
  (
    parentProps,
    props: Partial<Omit<ArrayItemProps, "depth" | "path" | "index">>
  ) => ({
    ...parentProps,
    ...props,
    index: parentProps.index,
    path: parentProps.path,
    depth: parentProps.depth,
  })
);
