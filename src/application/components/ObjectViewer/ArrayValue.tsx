import type { ReactNode } from "react";
import { useState, type ComponentPropsWithoutRef } from "react";
import type { Path } from "./types";
import { ObjectKeyLabel } from "./ObjectKeyLabel";
import { filterForwardedElementProps } from "./CustomRenderable";
import { useObjectViewerContext } from "./context";
import { ArrayValueNode } from "./ArrayValueNode";

interface ArrayValueProps extends ComponentPropsWithoutRef<"div"> {
  context: Record<string, any> | undefined;
  children: ReactNode;
  collapsible?: boolean;
  depth: number;
  path: Path;
  value: unknown[];
}

export function ArrayValue({
  children,
  collapsible = true,
  ...props
}: ArrayValueProps) {
  const { depth, context, value, path } = props;
  const ctx = useObjectViewerContext();
  const [collapsed, setCollapsed] = useState(() => {
    if (value.length === 0) {
      return true;
    }

    if (typeof ctx.collapsed === "function") {
      return ctx.collapsed({
        value,
        context,
        depth,
        defaultCollapsed: depth > 0,
        path,
      });
    }

    return typeof ctx.collapsed === "boolean"
      ? ctx.collapsed
      : depth >= ctx.collapsed;
  });

  function toggle() {
    if (value.length > 0 && collapsible) {
      setCollapsed((c) => !c);
    }
  }

  return (
    <div {...filterForwardedElementProps<"div">(props)}>
      <ObjectKeyLabel
        collapsible={value.length > 0 && collapsible}
        collapsed={collapsed}
        onClick={toggle}
      >
        {children}
      </ObjectKeyLabel>{" "}
      <ArrayValueNode
        {...props}
        collapsed={collapsible && collapsed}
        onToggleCollapsed={toggle}
      />
    </div>
  );
}
