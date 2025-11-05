import type { ComponentPropsWithoutRef } from "react";
import { ArrayItem } from "./ArrayItem";
import { CollectionLength } from "./CollectionLength";
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

interface ArrayNodeProps
  extends ComponentPropsWithoutRef<"span">,
    RenderableTypeProps<unknown[]> {}

export const ArrayNode = customRenderableType<unknown[]>(
  "array",
  ({ className, context, depth, value, path, ...rest }: ArrayNodeProps) => {
    const indexes = Object.keys(value).map(Number);
    const counts = new Map<number, number>();
    let items = value;

    // array is a sparse array
    if (value.length > indexes.length) {
      // maintain a sparse array unlike [...value]
      items = [];
      indexes.forEach((key, keyIdx) => {
        items[key] = value[key];

        if (key === 0) {
          return;
        }

        // If we don't have a previous index, the hole is at the start of the
        // array. Initialize the previous index -1 to include index 0 in the
        // count
        const previousIndex = indexes[keyIdx - 1] ?? -1;
        const expectedPreviousIndex = key - 1;

        // If the previous index
        if (previousIndex !== expectedPreviousIndex) {
          // Subtract 1 because we don't want to include the current item in the
          // count
          const gap = key - previousIndex - 1;

          items[key - 1] = undefined;
          counts.set(key - 1, gap);
        }
      });

      const expectedLastIndex = value.length - 1;
      const lastIndex = indexes.at(-1)!;
      if (lastIndex !== expectedLastIndex) {
        items[expectedLastIndex] = undefined;
        counts.set(expectedLastIndex, value.length - lastIndex);
      }
    }

    return (
      <span
        {...filterForwardedElementProps<"span">(rest)}
        className={clsx("align-middle", className)}
      >
        <OpenBracket />{" "}
        <CollectionLength
          className="inline-block align-middle italic"
          value={value}
        />
        <div className="pl-[3ch]">
          {items.map((item, idx) => {
            return counts.has(idx) ? (
              <>
                <SparseArrayEmptyItem key={idx} length={counts.get(idx)} />
                <Punctuation>,</Punctuation>
              </>
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
      </span>
    );
  }
);
