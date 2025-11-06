import type { ReactNode } from "react";
import { clsx } from "clsx";
import { Arrow } from "./Arrow";
import { Punctuation } from "./Punctuation";

interface ObjectKeyLabelProps {
  children: ReactNode;
  expandable: boolean;
  expanded?: boolean;
  onClick?: () => void;
}

export function ObjectKeyLabel({
  children,
  expandable,
  expanded,
  onClick,
}: ObjectKeyLabelProps) {
  return (
    <span
      className={clsx("inline-block align-middle relative", {
        "cursor-pointer": expandable,
      })}
      onClick={onClick}
    >
      <span className="inline-flex items-center">
        {expandable && <Arrow expanded={!!expanded} />}
        {children}
        <Punctuation>:</Punctuation>
      </span>
    </span>
  );
}
