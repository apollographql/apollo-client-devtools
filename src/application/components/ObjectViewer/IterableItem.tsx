/* eslint-disable testing-library/render-result-naming-convention */
import IconChevronRight from "@apollo/icons/default/IconChevronRight.svg";
import { clsx } from "clsx";
import { useState } from "react";
import { ValueNode } from "./ValueNode";
import { Bracket } from "./Bracket";
import { CollectionLength } from "./CollectionLength";
import { useRenderer } from "./useRenderer";
import { CustomNode } from "./CustomNode";

export function IterableItem({
  depth,
  itemKey,
  value,
}: {
  depth: number;
  itemKey: string | number;
  value: unknown;
}) {
  const renderer = useRenderer(value);
  let expandable =
    Array.isArray(value) || (typeof value === "object" && value !== null);

  if (renderer && "expandable" in renderer) {
    expandable =
      typeof renderer.expandable === "function"
        ? renderer.expandable(value)
        : renderer.expandable ?? false;
  }

  const [expanded, setExpanded] = useState(expandable ? depth === 0 : true);

  return (
    <div>
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
          {renderer ? (
            <CustomNode depth={depth} value={value} renderer={renderer} />
          ) : (
            <ValueNode depth={depth} value={value} />
          )}
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
