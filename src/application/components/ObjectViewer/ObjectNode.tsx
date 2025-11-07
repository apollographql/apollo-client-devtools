import type { ComponentPropsWithoutRef } from "react";
import { ObjectSize } from "./ObjectSize";
import {
  customRenderableType,
  filterForwardedElementProps,
} from "./CustomRenderable";
import { ObjectPair } from "./ObjectPair";
import type { RenderableTypeProps } from "./ObjectViewer";
import { clsx } from "clsx";
import { OpenBrace } from "./OpenBrace";
import { CloseBrace } from "./CloseBrace";
import { useContextValueFallback } from "./context";
import { EmptyObject } from "./EmptyObject";

interface ObjectNodeProps
  extends ComponentPropsWithoutRef<"span">,
    RenderableTypeProps<object> {
  displayObjectSize?: boolean;
}

export const ObjectNode = customRenderableType(
  "object",
  ({
    context,
    className,
    depth,
    value,
    path,
    displayObjectSize,
    ...rest
  }: ObjectNodeProps) => {
    const displayObjectSizeSetting = useContextValueFallback(
      "displayObjectSize",
      displayObjectSize
    );
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
            {displayObjectSizeSetting && (
              <ObjectSize
                label="key"
                className="inline-block align-middle italic"
                size={Object.keys(value).length}
              />
            )}
            <div className="pl-[3ch] border-l border-l-primary dark:border-l-primary-dark border-dashed">
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
            <EmptyObject />{" "}
            {displayObjectSizeSetting && (
              <ObjectSize
                label="key"
                className="inline-block align-middle italic"
                size={0}
              />
            )}
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
