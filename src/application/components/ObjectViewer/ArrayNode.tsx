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

interface ArrayNodeProps
  extends ComponentPropsWithoutRef<"span">,
    RenderableTypeProps<unknown[]> {}

export const ArrayNode = customRenderableType<unknown[]>(
  "array",
  ({ className, context, depth, value, path, ...rest }: ArrayNodeProps) => {
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
        <CloseBracket />
      </span>
    );
  }
);
