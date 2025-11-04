import type { ReactNode } from "react";
import { ValueNode } from "./ValueNode";
import type { Renderer } from "./ObjectViewer";

interface Props {
  depth: number;
  value: unknown;
  renderer: Renderer<unknown>;
}

export function CustomNode({ depth, value, renderer }: Props) {
  const { render: Render } = renderer;

  return (
    <Render
      value={value}
      renderDefault={(value) => <ValueNode depth={depth} value={value} />}
    />
  );
}
