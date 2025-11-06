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
  expandable?: boolean;
  depth: number;
  index: number;
  value: unknown;
  path: Path;
}

export const ArrayItem = customRenderable(
  "arrayItem",
  (props: ArrayItemProps) => {
    const { expandable, value, ...rest } = props;

    if (Array.isArray(value)) {
      return <ArrayValue {...rest} expandable={expandable} value={value} />;
    }

    if (typeof value === "object" && value !== null) {
      return <ObjectValue {...rest} expandable={expandable} value={value} />;
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

function ArrayValue({ expandable = true, ...props }: ArrayValueProps) {
  const { context, depth, index, value, ...rest } = props;
  const [expanded, setExpanded] = useState(value.length > 0 && depth === 0);

  function toggleExpanded() {
    if (value.length > 0 && expandable) {
      setExpanded((expanded) => !expanded);
    }
  }

  return (
    <div {...rest}>
      <ObjectKeyLabel
        expandable={value.length > 0 && expandable}
        expanded={expanded}
        onClick={toggleExpanded}
      >
        <ArrayIndex context={context} index={index} />
      </ObjectKeyLabel>{" "}
      {expanded || !expandable ? (
        <>
          <ValueNode className="align-middle" {...props} />
          <Punctuation>,</Punctuation>
        </>
      ) : (
        <span className="inline-block align-middle">
          <CollapsedArray
            {...props}
            length={value.length}
            onClick={toggleExpanded}
          />
          <Punctuation>,</Punctuation>{" "}
          <CollectionLength className="italic" length={value.length} />
        </span>
      )}
    </div>
  );
}

interface ObjectValueProps extends ArrayItemProps {
  value: object;
}

function ObjectValue({ expandable = true, ...props }: ObjectValueProps) {
  const { context, depth, index, value, ...rest } = props;
  const length = Object.keys(value).length;
  const [expanded, setExpanded] = useState(length > 0 && depth === 0);

  function toggleExpanded() {
    if (expandable) {
      setExpanded((expanded) => !expanded);
    }
  }

  return (
    <div {...rest}>
      <ObjectKeyLabel
        expandable={length > 0 && expandable}
        expanded={expanded}
        onClick={toggleExpanded}
      >
        <ArrayIndex context={context} index={index} />
      </ObjectKeyLabel>{" "}
      {expanded || !expandable ? (
        <>
          <ValueNode className="align-middle" {...props} />
          <Punctuation>,</Punctuation>
        </>
      ) : (
        <span className="inline-block align-middle">
          <CollapsedObject
            {...props}
            length={length}
            onClick={toggleExpanded}
          />
          <Punctuation>,</Punctuation>{" "}
          <CollectionLength className="italic" length={length} />
        </span>
      )}
    </div>
  );
}

interface OtherValueProps extends ArrayItemProps {
  expandable?: never;
}

function OtherValue(props: OtherValueProps) {
  const { context, index, value, ...rest } = props;

  return (
    <div {...rest}>
      <ObjectKeyLabel expandable={false}>
        <ArrayIndex context={context} index={index} />
      </ObjectKeyLabel>{" "}
      <ValueNode className="align-middle" {...props} />
      <Punctuation>,</Punctuation>
    </div>
  );
}
