import { useCallback } from "react";
import { useObjectViewerContext, useTypeOfValue } from "./context";
import { AnyValueNode } from "./AnyValueNode";
import type { RenderableTypeProps } from "./ObjectViewer";

export function CustomNode(parentProps: RenderableTypeProps<unknown>) {
  const { value } = parentProps;
  const ctx = useObjectViewerContext();
  const type = useTypeOfValue(value);
  const Render = ctx.renderers[type];

  const DefaultRender = useCallback(
    (props: Partial<RenderableTypeProps<unknown>>) => (
      <AnyValueNode
        {...{ ...parentProps, ...props }}
        context={{ ...parentProps.context, ...props.context }}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.values(parentProps)
  );

  return Render ? (
    <Render {...parentProps} DefaultRender={DefaultRender} />
  ) : null;
}
