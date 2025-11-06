import { useState, type ComponentPropsWithoutRef } from "react";
import { customRenderable } from "./CustomRenderable";
import type { Path } from "./types";
import { clsx } from "clsx";
import { ObjectKey } from "./ObjectKey";
import { ValueNode } from "./ValueNode";
import { CollectionLength } from "./CollectionLength";
import { Collapsed } from "./Collapsed";
import { Arrow } from "./Arrow";
import { Punctuation } from "./Punctuation";
import { getLengthOf } from "./getLengthOf";

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
    const length = getLengthOf(value);
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
            <ObjectKey context={context} value={objectKey} />
            <Punctuation>:</Punctuation>
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
            <Punctuation>,</Punctuation>
          </>
        ) : (
          <span className="inline-block align-middle">
            <Collapsed
              context={context}
              value={value}
              onClick={() => setExpanded(true)}
            />
            <Punctuation>,</Punctuation>{" "}
            <CollectionLength className="italic" length={length} />
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
