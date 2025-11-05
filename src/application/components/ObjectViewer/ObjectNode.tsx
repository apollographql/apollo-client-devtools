import { Bracket } from "./Bracket";
import { CollectionLength } from "./CollectionLength";
import { customRenderableType } from "./CustomRenderable";
import { ObjectPair } from "./ObjectPair";

export const ObjectNode = customRenderableType<object>(
  "object",
  ({ context, className, depth, value }) => {
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
          {Object.entries(value).map(([key, value], idx) => (
            <ObjectPair
              key={idx}
              context={context}
              className={className}
              depth={depth + 1}
              objectKey={key}
              value={value}
            />
          ))}
        </div>
        <Bracket type="close" value={value} />
      </>
    );
  }
);

function getConstructorName(value: object): string {
  try {
    return Object.getPrototypeOf(value).constructor.name;
  } catch (e) {
    return "<Blocked>";
  }
}
