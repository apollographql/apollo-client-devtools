import type { ReactNode } from "react";
import { ValueNode } from "./ValueNode";

interface Props {
  depth: number;
  value: unknown;
  render: React.FC<{
    value: unknown;
    renderDefault: (value: unknown) => ReactNode;
  }>;
}

export function CustomNode({ depth, value, render: Render }: Props) {
  return (
    <Render
      value={value}
      renderDefault={(value) => <ValueNode depth={depth} value={value} />}
    />
  );
}
