import type { ReactNode } from "react";
import { useState, type ComponentPropsWithoutRef } from "react";
import type { Path } from "./types";
import { ObjectKeyLabel } from "./ObjectKeyLabel";
import { CollapsedArray } from "./CollapsedArray";
import { Punctuation } from "./Punctuation";
import { CollectionLength } from "./CollectionLength";
import { AnyValue } from "./AnyValue";
import { filterForwardedElementProps } from "./CustomRenderable";

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
  const { depth, value } = props;
  const [collapsed, setCollapsed] = useState(value.length === 0 || depth > 0);

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
      {collapsible && collapsed ? (
        <span className="inline-block align-middle">
          <CollapsedArray {...props} length={value.length} onClick={toggle} />
          <Punctuation>,</Punctuation>{" "}
          <CollectionLength className="italic" length={value.length} />
        </span>
      ) : (
        <>
          <AnyValue className="align-middle" {...props} />
          <Punctuation>,</Punctuation>
        </>
      )}
    </div>
  );
}
