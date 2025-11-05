import IconChevronRight from "@apollo/icons/default/IconChevronRight.svg";
import { clsx } from "clsx";
import { useState } from "react";
import { ValueNode } from "./ValueNode";
import { Bracket } from "./Bracket";
import { CollectionLength } from "./CollectionLength";
import type { Path } from "./types";

export function IterableItem({
  expandable,
  className,
  context,
  depth,
  itemKey,
  value,
  path,
}: {
  expandable: boolean;
  className?: string;
  context: Record<string, any> | undefined;
  depth: number;
  itemKey: string | number;
  value: unknown;
  path: Path;
}) {
  const [expanded, setExpanded] = useState(expandable ? depth === 0 : true);

  return (
    <div className={className}>
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
          <span className="text-[var(--ov-arrayIndex-color,var(--ov-objectKey-color))]">
            {itemKey}
          </span>
          <span className="text-[var(--ov-punctuation-color)]">:</span>
        </span>
      </span>{" "}
      {expanded ? (
        <>
          <ValueNode
            context={context}
            depth={depth}
            value={value}
            path={path}
          />
          <span className="text-[var(--ov-punctuation-color)]">,</span>
        </>
      ) : (
        <span
          className="inline-block align-middle"
          onClick={() => setExpanded(true)}
        >
          <Bracket type="open" value={value} />
          <span
            className="text-[var(--ov-ellipsis-color,var(--ov-punctuation-color))] cursor-pointer"
            onClick={() => setExpanded(true)}
          >
            ...
          </span>
          <Bracket type="close" value={value} />
          <span className="text-[var(--ov-punctuation-color)]">,</span>{" "}
          {!expanded && typeof value === "object" && value !== null && (
            <CollectionLength className="italic" value={value} />
          )}
        </span>
      )}
    </div>
  );
}
