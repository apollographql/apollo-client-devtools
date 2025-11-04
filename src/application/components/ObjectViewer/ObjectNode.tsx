import IconChevronRight from "@apollo/icons/default/IconChevronRight.svg";
import { ValueNode } from "./ValueNode";
import clsx from "clsx";
import { Bracket } from "./Bracket";
import { CollectionLength } from "./CollectionLength";

interface Props {
  depth: number;
  value: object;
}

export function ObjectNode({ depth, value }: Props) {
  const constructorName = getConstructorName(value);

  return (
    <>
      {constructorName !== "Object" && (
        <span className="italic inline-block align-middle text-[var(--ov-constructorName-color,var(--ov-info-color))]">
          {constructorName}
        </span>
      )}{" "}
      <Bracket type="open" value={value} />{" "}
      <CollectionLength
        className="inline-block align-middle italic"
        value={value}
      />
      <div className="pl-[2ch]">
        {Array.from(Object.entries(value)).map(([key, value], idx) => {
          const expandable =
            Array.isArray(value) ||
            (typeof value === "object" && value !== null);

          const keyNode = (
            <span
              className={clsx("text-[var(--ov-objectKey-color)]", {
                "inline-block align-middle": expandable,
              })}
            >
              {key}
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
              <ValueNode depth={depth + 1} value={value} />
              <span className="text-[var(--ov-punctuation-color)]">,</span>
            </div>
          );
        })}
      </div>
      <Bracket type="close" value={value} />
    </>
  );
}

function getConstructorName(value: object): string {
  try {
    return Object.getPrototypeOf(value).constructor.name;
  } catch (e) {
    return "<Blocked>";
  }
}
