import { customRenderable } from "./CustomRenderable";

interface SparseArrayEmptyItemProps {
  label?: string;
  length: number;
}

export const SparseArrayEmptyItem = customRenderable(
  "sparseArrayEmptyItem",
  ({ label = "empty", length }) => {
    return (
      <span className="text-[var(--ov-sparseArrayEmptyItem-color,var(--ov-punctuation-color))] text-sm">
        {label} &times; {length}
      </span>
    );
  },
  (parentProps, props: Omit<SparseArrayEmptyItemProps, "length">) => ({
    ...parentProps,
    ...props,
    length: parentProps.length,
  })
);
