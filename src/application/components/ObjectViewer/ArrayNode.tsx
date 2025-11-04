import IconChevronRight from "@apollo/icons/default/IconChevronRight.svg";
import { Bracket } from "./Bracket";
import { ValueNode } from "./ValueNode";
import { clsx } from "clsx";
import { useState } from "react";

interface Props {
  depth: number;
  value: unknown[];
}

export function ArrayNode({ depth, value }: Props) {
  return (
    <>
      <Bracket value={value} type="open" />{" "}
      <span className="italic inline-block align-middle text-[var(--ov-info-color)]">
        {value.length} items
      </span>
      <div className="pl-[2ch]">
        {value.map((item, idx) => (
          <ArrayItem key={idx} depth={depth} index={idx} value={item} />
        ))}
      </div>
      <Bracket type="close" value={value} />
    </>
  );
}

function ArrayItem({
  depth,
  index,
  value,
}: {
  depth: number;
  index: number;
  value: unknown;
}) {
  const expandable =
    Array.isArray(value) || (typeof value === "object" && value !== null);
  const [expanded, setExpanded] = useState(expandable ? depth <= 1 : true);

  const keyNode = (
    <>
      <span
        className={clsx(
          "text-[var(--ov-arrayIndex-color,var(--ov-objectKey-color))]",
          { "inline-block align-middle": expandable }
        )}
      >
        {index}
      </span>
      <span
        className={clsx("text-[var(--ov-punctuation-color)]", {
          "inline-block align-middle": expandable,
        })}
      >
        :
      </span>{" "}
    </>
  );

  return (
    <div>
      {expandable ? (
        <span
          className="inline-block align-middle relative cursor-pointer"
          onClick={() => setExpanded((expanded) => !expanded)}
        >
          <button className="inline-block align-middle size-4 hover:bg-secondary dark:hover:bg-secondary-dark rounded absolute -left-5 top-1/2 -translate-y-1/2">
            <IconChevronRight className="block size-4" />
          </button>
          {keyNode}
        </span>
      ) : (
        keyNode
      )}
      {expanded ? <ValueNode depth={depth + 1} value={value} /> : "..."}
      <span className="text-[var(--ov-punctuation-color)]">,</span>
    </div>
  );
}
