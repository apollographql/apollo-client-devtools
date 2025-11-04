import { ValueNode } from "./ValueNode";
import type { CustomRenderProps, Renderer } from "./ObjectViewer";
import { useCallback } from "react";

interface Props {
  depth: number;
  value: unknown;
  renderer: Renderer<unknown>;
}

export function CustomNode({ depth, value, renderer }: Props) {
  const { render: Render } = renderer;
  const DefaultRender = useCallback<CustomRenderProps["DefaultRender"]>(
    (props) => <ValueNode depth={depth} {...props} />,
    [depth]
  );

  return <Render value={value} DefaultRender={DefaultRender} />;
}
