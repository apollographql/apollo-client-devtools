import type { ComponentPropsWithoutRef } from "react";
import { Bracket } from "./Bracket";
import { CollectionLength } from "./CollectionLength";
import {
  customRenderableType,
  filterForwardedElementProps,
} from "./CustomRenderable";
import { ObjectPair } from "./ObjectPair";
import type { RenderableTypeProps } from "./ObjectViewer";
import { clsx } from "clsx";

interface ObjectNodeProps
  extends ComponentPropsWithoutRef<"span">,
    RenderableTypeProps<object> {}

export const ObjectNode = customRenderableType(
  "object",
  ({ context, className, depth, value, path, ...rest }: ObjectNodeProps) => {
    const constructorName = getConstructorName(value);

    return (
      <span
        {...filterForwardedElementProps<"span">(rest)}
        className={clsx("align-middle", className)}
      >
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
              depth={depth + 1}
              objectKey={key}
              value={value}
              path={path.concat(key)}
            />
          ))}
        </div>
        <Bracket type="close" value={value} />
      </span>
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
