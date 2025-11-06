import { Fragment, type ComponentPropsWithoutRef } from "react";
import { ArrayItem } from "./ArrayItem";
import { ObjectSize } from "./ObjectSize";
import {
  customRenderableType,
  filterForwardedElementProps,
} from "./CustomRenderable";
import type { RenderableTypeProps } from "./ObjectViewer";
import { clsx } from "clsx";
import { OpenBracket } from "./OpenBracket";
import { CloseBracket } from "./CloseBracket";
import { SparseArrayEmptyItem } from "./SparseArrayEmptyItem";
import { Punctuation } from "./Punctuation";
import { useContextValueFallback } from "./context";
import { EmptyArray } from "./EmptyArray";

interface ArrayNodeProps
  extends ComponentPropsWithoutRef<"span">,
    RenderableTypeProps<unknown[]> {
  displayObjectSize?: boolean;
}

export const ArrayNode = customRenderableType<unknown[]>(
  "array",
  ({
    className,
    context,
    depth,
    value,
    path,
    displayObjectSize,
    ...rest
  }: ArrayNodeProps) => {
    const displayObjectSizeSetting = useContextValueFallback(
      "displayObjectSize",
      displayObjectSize
    );
    const indexes = Object.keys(value);

    const [items, holeSizes] =
      value.length > indexes.length ? getSparseArray(value) : [value];

    return (
      <span
        {...filterForwardedElementProps<"span">(rest)}
        className={clsx("align-middle", className)}
      >
        {value.length > 0 ? (
          <>
            <OpenBracket />{" "}
            {displayObjectSizeSetting && (
              <ObjectSize
                className="inline-block align-middle italic"
                size={value.length}
              />
            )}
            <div className="pl-[3ch] border-l border-l-primary dark:border-l-primary-dark border-dashed">
              {items.map((item, idx) => {
                return holeSizes?.has(idx) ? (
                  <Fragment key={idx}>
                    <SparseArrayEmptyItem
                      key={idx}
                      length={holeSizes.get(idx)}
                    />
                    <Punctuation>,</Punctuation>
                  </Fragment>
                ) : (
                  <ArrayItem
                    key={idx}
                    context={context}
                    depth={depth + 1}
                    index={idx}
                    value={item}
                    path={path.concat(idx)}
                  />
                );
              })}
            </div>
            <CloseBracket />
          </>
        ) : (
          <>
            <EmptyArray />{" "}
            {displayObjectSizeSetting && (
              <ObjectSize
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

function getSparseArray(
  value: unknown[]
): [sparseArray: unknown[], holeSizes: Map<number, number>] {
  const indexes = Object.keys(value).map(Number);
  const holeSizes = new Map<number, number>();
  const sparseArray = [];

  indexes.forEach((index, keyIndex) => {
    sparseArray[index] = value[index];

    // There aren't any values before index 0 so we don't need to do anything
    if (index === 0) {
      return;
    }

    // If we don't have a previous index, the hole is at the start of the
    // array. Set `previousIndex` so that index 0 is included in the gap count
    const previousIndex = indexes[keyIndex - 1] ?? -1;
    const expectedPreviousIndex = index - 1;

    if (previousIndex !== expectedPreviousIndex) {
      // Add a value at the hole using the previous index so that this item can
      // be rendered by the array node. We can avoid an actual value here
      // because the map of hole sizes includes this index.
      sparseArray[expectedPreviousIndex] = undefined;

      // Subtract 1 so we don't include the current item in the hole size
      holeSizes.set(index - 1, index - previousIndex - 1);
    }
  });

  // There may be a hole at the end of the array that we need to account for
  const expectedLastIndex = value.length - 1;
  const lastIndex = indexes.at(-1)!;

  if (lastIndex !== expectedLastIndex) {
    sparseArray[expectedLastIndex] = undefined;
    holeSizes.set(expectedLastIndex, value.length - lastIndex);
  }

  return [sparseArray, holeSizes];
}
