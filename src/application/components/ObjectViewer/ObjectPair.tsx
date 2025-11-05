import IconChevronRight from "@apollo/icons/default/IconChevronRight.svg";
import { useState, type ComponentPropsWithoutRef } from "react";
import { customRenderable } from "./CustomRenderable";
import type { Path } from "./types";
import { clsx } from "clsx";
import { ObjectKey } from "./ObjectKey";
import { ValueNode } from "./ValueNode";
import { CollapsedObject } from "./CollapsedObject";
import { CollectionLength } from "./CollectionLength";

interface ObjectPairProps extends ComponentPropsWithoutRef<"div"> {
  context: Record<string, any> | undefined;
  depth: number;
  expandable?: boolean;
  objectKey: string;
  value: unknown;
  path: Path;
}

export const ObjectPair = customRenderable(
  "objectPair",
  ({
    context,
    depth,
    path,
    value,
    objectKey,
    expandable = Array.isArray(value) ||
      (typeof value === "object" && value !== null),
    ...rest
  }: ObjectPairProps) => {
    const [expanded, setExpanded] = useState(expandable ? depth === 0 : true);

    return (
      <div {...rest}>
        <span
          className={clsx("inline-block align-middle relative", {
            "cursor-pointer": expandable,
          })}
          onClick={
            expandable ? () => setExpanded((expanded) => !expanded) : undefined
          }
        >
          <span className="inline-flex items-center">
            {expandable && (
              <IconChevronRight
                className={clsx(
                  "block size-4 transition-transform ease-out absolute -left-5 top-1/2 -translate-y-1/2",
                  {
                    "rotate-90": expanded,
                  }
                )}
              />
            )}
            <ObjectKey context={context} value={objectKey} />
            <span className="text-[var(--ov-punctuation-color)]">:</span>
          </span>
        </span>{" "}
        {expanded ? (
          <>
            <ValueNode
              className="align-middle"
              context={context}
              depth={depth}
              value={value}
              path={path}
            />
            <span className="text-[var(--ov-punctuation-color)]">,</span>
          </>
        ) : (
          <span className="inline-block align-middle">
            <CollapsedObject
              context={context}
              onClick={() => setExpanded(true)}
            />
            <span className="text-[var(--ov-punctuation-color)]">,</span>{" "}
            {!expanded && typeof value === "object" && value !== null && (
              <CollectionLength className="italic" value={value} />
            )}
          </span>
        )}
      </div>
    );
  },
  (parentProps, props: Partial<Omit<ObjectPairProps, "depth" | "path">>) => ({
    ...parentProps,
    ...props,
    depth: parentProps.depth,
  })
);
