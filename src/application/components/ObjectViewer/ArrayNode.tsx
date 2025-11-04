import { Bracket } from "./Bracket";
import { CollectionLength } from "./CollectionLength";
import { customRenderable } from "./CustomRenderable";
import { IterableItem } from "./IterableItem";

export const ArrayNode = customRenderable<unknown[]>(
  "array",
  ({ className, context, depth, value }) => {
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
              context={context}
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
);
