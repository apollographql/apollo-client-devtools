import { useCallback, useRef } from "react";
import { useObjectViewerContext } from "./context";
import { AnyValueNode } from "./AnyValueNode";
import { equal } from "@wry/equality";
import type { RenderableTypeProps } from "./ObjectViewer";

export function CustomNode({
  type,
  ...parentProps
}: RenderableTypeProps<unknown> & { type: string }) {
  const ctx = useObjectViewerContext();
  const Render = ctx.renderers[type];
  const ref = useRef(parentProps);

  if (!equal(ref.current, parentProps)) {
    ref.current = parentProps;
  }

  const DefaultRender = useCallback(
    (props: Partial<RenderableTypeProps<unknown>>) => (
      <AnyValueNode
        {...{ ...ref.current, ...props }}
        context={{ ...ref.current.context, ...props.context }}
      />
    ),
    []
  );

  return Render ? (
    <Render {...parentProps} DefaultRender={DefaultRender} />
  ) : null;
}
