import type { ComponentPropsWithoutRef } from "react";
import { ArrayItem } from "./ArrayItem";
import { Bracket } from "./Bracket";
import { CollectionLength } from "./CollectionLength";
import {
  customRenderableType,
  filterForwardedElementProps,
} from "./CustomRenderable";
import type { RenderableTypeProps } from "./ObjectViewer";

interface ArrayNodeProps
  extends ComponentPropsWithoutRef<"span">,
    RenderableTypeProps<unknown[]> {}

export const ArrayNode = customRenderableType<unknown[]>(
  "array",
  ({ className, context, depth, value, path, ...rest }: ArrayNodeProps) => {
    return (
      <span
        {...filterForwardedElementProps<"span">(rest)}
        className={className}
      >
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
              depth={depth + 1}
              index={idx}
              value={item}
              path={path.concat(idx)}
            />
          ))}
        </div>
        <Bracket type="close" value={value} />
      </span>
    );
  }
);
