import { Bracket } from "./Bracket";
import { CollectionLength } from "./CollectionLength";
import { IterableItem } from "./IterableItem";

interface Props {
  className?: string;
  depth: number;
  value: object;
}

export function ObjectNode({ className, depth, value }: Props) {
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
        {Array.from(Object.entries(value)).map(([key, value], idx) => (
          <IterableItem
            key={idx}
            className={className}
            depth={depth + 1}
            itemKey={key}
            value={value}
          />
        ))}
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
