import IconChevronRight from "@apollo/icons/default/IconChevronRight.svg";
import { Bracket } from "./Bracket";
import { ValueNode } from "./ValueNode";
import { clsx } from "clsx";

interface Props {
  depth: number;
  value: unknown[];
}

export function ArrayNode({ depth, value }: Props) {
  return (
    <>
      <Bracket text="[" />{" "}
      <span className="italic inline-block align-middle text-[var(--ov-info-color)]">
        {value.length} items
      </span>
      <div className="pl-[2ch]">
        {value.map((item, idx) => {
          const expandable =
            Array.isArray(item) || (typeof item === "object" && item !== null);

          const keyNode = (
            <span
              className={clsx(
                "text-[var(--ov-arrayIndex-color,var(--ov-objectKey-color))]",
                { "inline-block align-middle": expandable }
              )}
            >
              {idx}
            </span>
          );

          return (
            <div key={idx}>
              {expandable ? (
                <span className="inline-block align-middle relative">
                  <button className="inline-block align-middle size-4 hover:bg-secondary dark:hover:bg-secondary-dark rounded absolute -left-5 top-1/2 -translate-y-1/2">
                    <IconChevronRight className="block size-4" />
                  </button>
                  {keyNode}
                </span>
              ) : (
                keyNode
              )}
              <span
                className={clsx("text-[var(--ov-punctuation-color)]", {
                  "inline-block align-middle": expandable,
                })}
              >
                :
              </span>{" "}
              <ValueNode depth={depth + 1} value={item} />
              <span className="text-[var(--ov-punctuation-color)]">,</span>
            </div>
          );
        })}
      </div>
      <Bracket text="]" />
    </>
  );
}
