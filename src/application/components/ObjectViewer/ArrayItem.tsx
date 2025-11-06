import { useState, type ComponentPropsWithoutRef } from "react";
import { customRenderable } from "./CustomRenderable";
import type { Path } from "./types";
import { ArrayIndex } from "./ArrayIndex";
import { ValueNode } from "./ValueNode";
import { CollectionLength } from "./CollectionLength";
import { Punctuation } from "./Punctuation";
import { CollapsedArray } from "./CollapsedArray";
import { CollapsedObject } from "./CollapsedObject";
import { ObjectKeyLabel } from "./ObjectKeyLabel";

interface ArrayItemProps extends ComponentPropsWithoutRef<"div"> {
  context: Record<string, any> | undefined;
  collapsible?: boolean;
  depth: number;
  index: number;
  value: unknown;
  path: Path;
}

export const ArrayItem = customRenderable(
  "arrayItem",
  (props: ArrayItemProps) => {
    const { collapsible, value, ...rest } = props;

    if (Array.isArray(value)) {
      return <ArrayValue {...rest} collapsible={collapsible} value={value} />;
    }

    if (typeof value === "object" && value !== null) {
      return <ObjectValue {...rest} collapsible={collapsible} value={value} />;
    }

    return <OtherValue {...rest} value={value} />;
  },
  (parentProps, props: Partial<Omit<ArrayItemProps, "depth">>) => ({
    ...parentProps,
    ...props,
    path: parentProps.path,
    depth: parentProps.depth,
  })
);

interface ArrayValueProps extends ArrayItemProps {
  value: unknown[];
}

function ArrayValue({ collapsible = true, ...props }: ArrayValueProps) {
  const { context, depth, index, value, ...rest } = props;
  const [collapsed, setCollapsed] = useState(value.length === 0 || depth > 0);

  function toggle() {
    if (value.length > 0 && collapsible) {
      setCollapsed((c) => !c);
    }
  }

  return (
    <div {...rest}>
      <ObjectKeyLabel
        collapsible={value.length > 0 && collapsible}
        collapsed={collapsed}
        onClick={toggle}
      >
        <ArrayIndex context={context} index={index} />
      </ObjectKeyLabel>{" "}
      {collapsible && collapsed ? (
        <span className="inline-block align-middle">
          <CollapsedArray {...props} length={value.length} onClick={toggle} />
          <Punctuation>,</Punctuation>{" "}
          <CollectionLength className="italic" length={value.length} />
        </span>
      ) : (
        <>
          <ValueNode className="align-middle" {...props} />
          <Punctuation>,</Punctuation>
        </>
      )}
    </div>
  );
}

interface ObjectValueProps extends ArrayItemProps {
  value: object;
}

function ObjectValue({ collapsible = true, ...props }: ObjectValueProps) {
  const { context, depth, index, value, ...rest } = props;
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
        <ArrayIndex context={context} index={index} />
      </ObjectKeyLabel>{" "}
      {collapsible && collapsed ? (
        <span className="inline-block align-middle">
          <CollapsedObject
            {...props}
            length={length}
            onClick={toggleExpanded}
          />
          <Punctuation>,</Punctuation>{" "}
          <CollectionLength className="italic" length={length} />
        </span>
      ) : (
        <>
          <ValueNode className="align-middle" {...props} />
          <Punctuation>,</Punctuation>
        </>
      )}
    </div>
  );
}

interface OtherValueProps extends ArrayItemProps {
  collapsible?: never;
}

function OtherValue(props: OtherValueProps) {
  const { context, index, value, ...rest } = props;

  return (
    <div {...rest}>
      <ObjectKeyLabel collapsible={false}>
        <ArrayIndex context={context} index={index} />
      </ObjectKeyLabel>{" "}
      <ValueNode className="align-middle" {...props} />
      <Punctuation>,</Punctuation>
    </div>
  );
}
