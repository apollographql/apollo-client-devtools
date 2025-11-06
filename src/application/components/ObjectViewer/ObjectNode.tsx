import type { ComponentPropsWithoutRef } from "react";
import { CollectionLength } from "./CollectionLength";
import {
  customRenderableType,
  filterForwardedElementProps,
} from "./CustomRenderable";
import { ObjectPair } from "./ObjectPair";
import type { RenderableTypeProps } from "./ObjectViewer";
import { clsx } from "clsx";
import { OpenBrace } from "./OpenBrace";
import { CloseBrace } from "./CloseBrace";
import { CollapsedObject } from "./CollapsedObject";

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
        {Object.keys(value).length > 0 ? (
          <>
            <OpenBrace />{" "}
            <CollectionLength
              className="inline-block align-middle italic"
              length={Object.keys(value).length}
            />
            <div className="pl-[3ch]">
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
            <CloseBrace />
          </>
        ) : (
          <>
            <CollapsedObject
              className="inline-block align-middle"
              context={context}
              length={0}
            />{" "}
            <CollectionLength
              className="inline-block align-middle italic"
              length={0}
            />
          </>
        )}
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
