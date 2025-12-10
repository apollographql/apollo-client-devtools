import type { ReactNode } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { CollapsedArray } from "./CollapsedArray";
import { Punctuation } from "./Punctuation";
import { ObjectSize } from "./ObjectSize";
import { AnyValue } from "./AnyValue";
import { customRenderable } from "./CustomRenderable";
import { EmptyArray } from "./EmptyArray";
import type { RenderableTypeProps } from "./ObjectViewer";
import { useDisplayObjectSize } from "./useDisplayObjectSize";

interface ArrayValueNodeProps
  extends ComponentPropsWithoutRef<"div">,
    RenderableTypeProps<unknown[]> {
  collapsed: boolean;
  displayObjectSize?: boolean;
  onToggleCollapsed: () => void;
  getCollapsedElement?: (options: {
    value: unknown[];
    onToggleCollapsed: () => void;
  }) => ReactNode;
}

export const ArrayValueNode = customRenderable(
  "arrayValue",
  ({
    collapsed,
    onToggleCollapsed,
    getCollapsedElement = ({ value, onToggleCollapsed }) => {
      return value.length > 0 ? (
        <CollapsedArray
          {...props}
          className="cursor-pointer"
          onClick={onToggleCollapsed}
        />
      ) : (
        <EmptyArray />
      );
    },
    ...props
  }: ArrayValueNodeProps) => {
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
          <ObjectSize className="italic" size={value.length} />
        )}
      </span>
    ) : (
      <>
        <AnyValue className="align-middle" {...props} />
        <Punctuation>,</Punctuation>
      </>
    );
  }
);
