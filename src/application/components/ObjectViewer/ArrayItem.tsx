import { useState, type ComponentPropsWithoutRef } from "react";
import { customRenderable } from "./CustomRenderable";
import type { Path } from "./types";
import { clsx } from "clsx";
import { ArrayIndex } from "./ArrayIndex";
import { ValueNode } from "./ValueNode";
import { CollectionLength } from "./CollectionLength";
import { Collapsed } from "./Collapsed";
import { Arrow } from "./Arrow";

interface ArrayItemProps extends ComponentPropsWithoutRef<"div"> {
  context: Record<string, any> | undefined;
  expandable?: boolean;
  depth: number;
  index: number;
  value: unknown;
  path: Path;
}

export const ArrayItem = customRenderable(
  "arrayItem",
  ({
    depth,
    context,
    index,
    value,
    path,
    expandable = Array.isArray(value) ||
      (typeof value === "object" && value !== null),
    ...rest
  }: ArrayItemProps) => {
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
            {expandable && <Arrow expanded={expanded} />}
            <ArrayIndex context={context} index={index} />
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
            <Collapsed
              context={context}
              value={value}
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
  (parentProps, props: Partial<Omit<ArrayItemProps, "depth">>) => ({
    ...parentProps,
    ...props,
    depth: parentProps.depth,
  })
);
