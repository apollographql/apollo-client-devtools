import type { ComponentPropsWithoutRef } from "react";
import { customRenderable } from "./CustomRenderable";
import { ObjectKey } from "./ObjectKey";
import { AnyValue } from "./AnyValue";
import { Punctuation } from "./Punctuation";
import { ObjectKeyLabel } from "./ObjectKeyLabel";
import { ArrayValue } from "./ArrayValue";
import { ObjectValue } from "./ObjectValue";
import type { RenderableTypeProps } from "./ObjectViewer";

interface ObjectPairProps
  extends ComponentPropsWithoutRef<"div">,
    RenderableTypeProps<unknown> {
  collapsible?: boolean;
  objectKey: string;
}

export const ObjectPair = customRenderable(
  "objectPair",
  (props: ObjectPairProps) => {
    const { value, objectKey, ...rest } = props;

    if (Array.isArray(value)) {
      return (
        <ArrayValue {...rest} value={value}>
          <ObjectKey context={props.context} value={objectKey} />
        </ArrayValue>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <ObjectValue {...rest} value={value}>
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
