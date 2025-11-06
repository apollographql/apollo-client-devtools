import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useState } from "react";
import type { Path } from "./types";
import { ObjectKeyLabel } from "./ObjectKeyLabel";
import { CollapsedObject } from "./CollapsedObject";
import { Punctuation } from "./Punctuation";
import { ObjectSize } from "./ObjectSize";
import { AnyValue } from "./AnyValue";

interface ObjectValueProps extends ComponentPropsWithoutRef<"div"> {
  context: Record<string, any> | undefined;
  children: ReactNode;
  collapsible?: boolean;
  depth: number;
  displayObjectSize: boolean;
  path: Path;
  value: object;
}

export function ObjectValue({
  children,
  collapsible = true,
  displayObjectSize,
  ...props
}: ObjectValueProps) {
  const { context, depth, value, ...rest } = props;
  const length = Object.keys(value).length;
  const [collapsed, setCollapsed] = useState(length === 0 || depth > 0);

  function toggleExpanded() {
    if (length > 0 && collapsible) {
      setCollapsed((c) => !c);
    }
  }

  return (
    <div {...rest}>
      <ObjectKeyLabel
        collapsible={length > 0 && collapsible}
        collapsed={collapsed}
        onClick={toggleExpanded}
      >
        {children}
      </ObjectKeyLabel>{" "}
      {collapsible && collapsed ? (
        <span className="inline-block align-middle">
          <CollapsedObject
            {...props}
            length={length}
            onClick={toggleExpanded}
          />
          <Punctuation>,</Punctuation>{" "}
          {displayObjectSize && <ObjectSize className="italic" size={length} />}
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
