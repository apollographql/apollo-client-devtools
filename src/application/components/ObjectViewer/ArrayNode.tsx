import { ArrayItem } from "./ArrayItem";
import { Bracket } from "./Bracket";
import { CollectionLength } from "./CollectionLength";
import { customRenderableType } from "./CustomRenderable";

export const ArrayNode = customRenderableType<unknown[]>(
  "array",
  ({ className, context, depth, value, path }) => {
    return (
      <>
        <Bracket value={value} type="open" />{" "}
        <CollectionLength
          className="inline-block align-middle italic"
          value={value}
        />
        <div className="pl-[2ch]">
          {value.map((item, idx) => (
            <ArrayItem
              key={idx}
              context={context}
              className={className}
              depth={depth + 1}
              index={idx}
              value={item}
              path={path.concat(idx)}
            />
          ))}
        </div>
        <Bracket type="close" value={value} />
      </>
    );
  }
);
