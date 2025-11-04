import { Bracket } from "./Bracket";
import { ValueNode } from "./ValueNode";

interface Props {
  value: unknown[];
}

export function ArrayNode({ value }: Props) {
  return (
    <>
      <Bracket text="[" />{" "}
      <span className="italic text-[var(--ov-info-color)]">
        {value.length} items
      </span>
      {value.map((item, idx) => (
        <div key={idx} className="pl-4">
          <ValueNode value={item} />
          <span className="text-[var(--ov-punctuation-color)]">,</span>
        </div>
      ))}
      <Bracket text="]" />
    </>
  );
}
