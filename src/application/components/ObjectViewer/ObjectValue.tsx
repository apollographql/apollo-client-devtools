import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useState } from "react";
import type { Path } from "./types";
import { ObjectKeyLabel } from "./ObjectKeyLabel";
import { useObjectViewerContext } from "./context";
import { ObjectValueNode } from "./ObjectValueNode";

interface ObjectValueProps extends ComponentPropsWithoutRef<"div"> {
  context: Record<string, any> | undefined;
  children: ReactNode;
  collapsible?: boolean;
  depth: number;
  path: Path;
  value: object;
}

export function ObjectValue({
  children,
  collapsible = true,
  ...props
}: ObjectValueProps) {
  const { context, depth, value, ...rest } = props;
  const ctx = useObjectViewerContext();
  const length = Object.keys(value).length;
  const [collapsed, setCollapsed] = useState(
    length === 0 ||
      (typeof ctx.collapsed === "boolean"
        ? ctx.collapsed
        : depth >= ctx.collapsed)
  );

  function toggle() {
    if (length > 0 && collapsible) {
      setCollapsed((c) => !c);
    }
  }

  return (
    <div {...rest}>
      <ObjectKeyLabel
        collapsible={length > 0 && collapsible}
        collapsed={collapsed}
        onClick={toggle}
      >
        {children}
      </ObjectKeyLabel>{" "}
      <ObjectValueNode
        {...props}
        collapsed={collapsible && collapsed}
        onToggleCollapsed={toggle}
      />
    </div>
  );
}
