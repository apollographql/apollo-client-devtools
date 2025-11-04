import { Brace } from "./Brace";
import { ValueNode } from "./ValueNode";

interface Props {
  value: object;
}

export function ObjectNode({ value }: Props) {
  const constructorName = getConstructorName(value);
  const entries = Array.from(Object.entries(value));

  return (
    <>
      {constructorName !== "Object" && (
        <span className="italic text-[var(--ov-constructorName-color,var(--ov-info-color))]">
          {constructorName}
        </span>
      )}{" "}
      <Brace text="{" />{" "}
      <span className="italic text-[var(--ov-info-color)]">
        {entries.length} items
      </span>
      {entries.map(([key, value], idx) => {
        return (
          <div key={idx} className="pl-4">
            <span className="text-[var(--ov-objectKey-color)]">{key}</span>
            <span className="text-[var(--ov-punctuation-color)]">:</span>{" "}
            <ValueNode value={value} />
            <span className="text-[var(--ov-punctuation-color)]">,</span>
          </div>
        );
      })}
      <Brace text="}" />
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
