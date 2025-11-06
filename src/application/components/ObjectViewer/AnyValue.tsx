import type { ComponentPropsWithoutRef } from "react";
import type { RenderableTypeProps } from "./ObjectViewer";
import { AnyValueNode } from "./AnyValueNode";
import { getTypeOf } from "./getTypeOf";
import { useObjectViewerContext } from "./context";

interface AnyValueProps
  extends ComponentPropsWithoutRef<"div">,
    RenderableTypeProps<unknown> {}

export const AnyValue = ({ value, ...props }: AnyValueProps) => {
  const ctx = useObjectViewerContext();
  const type = ctx.getTypeOf?.(value) ?? getTypeOf(value);

  return <AnyValueNode {...props} type={type} value={value} />;
};
