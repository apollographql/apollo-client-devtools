import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { customRenderable } from "./CustomRenderable";
import { CollapsedObject } from "./CollapsedObject";
import { EmptyObject } from "./EmptyObject";
import { Punctuation } from "./Punctuation";
import { ObjectSize } from "./ObjectSize";
import { AnyValue } from "./AnyValue";
import type { RenderableTypeProps } from "./ObjectViewer";
import { useDisplayObjectSize } from "./useDisplayObjectSize";

interface ObjectValueNodeProps
  extends ComponentPropsWithoutRef<"div">,
    RenderableTypeProps<object> {
  collapsed: boolean;
  displayObjectSize?: boolean;
  onToggleCollapsed: () => void;
  getCollapsedElement?: (options: {
    value: object;
    onToggleCollapsed: () => void;
  }) => ReactNode;
}

export const ObjectValueNode = customRenderable(
  "objectValue",
  ({
    collapsed,
    onToggleCollapsed,
    getCollapsedElement = ({ value, onToggleCollapsed }) => {
      return Object.keys(value).length > 0 ? (
        <CollapsedObject
          {...props}
          className="cursor-pointer"
          onClick={onToggleCollapsed}
        />
      ) : (
        <EmptyObject />
      );
    },
    ...props
  }: ObjectValueNodeProps) => {
    const { displayObjectSize, value, depth, context, path } = props;
    const displayObjectSizeSetting = useDisplayObjectSize({
      displayObjectSize,
      depth,
      value,
      context,
      path,
    });

    return collapsed ? (
      <span className="inline-block align-middle">
        {getCollapsedElement({ value, onToggleCollapsed })}
        <Punctuation>,</Punctuation>{" "}
        {displayObjectSizeSetting && (
          <ObjectSize
            className="italic"
            size={Object.keys(value).length}
            label="key"
          />
        )}
      </span>
    ) : (
      <>
        <AnyValue className="align-middle" {...props} />
        <Punctuation>,</Punctuation>
      </>
    );
  },
  (
    parentProps,
    props: Partial<Omit<ObjectValueNodeProps, "depth" | "path">>
  ) => ({
    ...parentProps,
    ...props,
    context: { ...parentProps.context, ...props.context },
    depth: parentProps.depth,
    path: parentProps.path,
  })
);
