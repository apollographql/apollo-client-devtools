import { Bracket } from "./Bracket";
import { CollectionLength } from "./CollectionLength";
import { IterableItem } from "./IterableItem";

interface Props {
  className?: string;
  depth: number;
  value: unknown[];
}

export function ArrayNode({ className, depth, value }: Props) {
  return (
    <>
      <Bracket value={value} type="open" />{" "}
      <CollectionLength
        className="inline-block align-middle italic"
        value={value}
      />
      <div className="pl-[2ch]">
        {value.map((item, idx) => (
          <IterableItem
            key={idx}
            className={className}
            depth={depth + 1}
            itemKey={idx}
            value={item}
          />
        ))}
      </div>
      <Bracket type="close" value={value} />
    </>
  );
}
