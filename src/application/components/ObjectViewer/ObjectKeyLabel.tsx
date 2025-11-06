import type { ReactNode } from "react";
import { clsx } from "clsx";
import { Arrow } from "./Arrow";
import { Punctuation } from "./Punctuation";

interface ObjectKeyLabelProps {
  children: ReactNode;
  collapsible: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

export function ObjectKeyLabel({
  children,
  collapsible,
  collapsed,
  onClick,
}: ObjectKeyLabelProps) {
  return (
    <span
      className={clsx("inline-block align-middle relative", {
        "cursor-pointer": collapsible,
      })}
      onClick={onClick}
    >
      <span className="inline-flex items-center">
        {collapsible && <Arrow collapsed={!!collapsed} />}
        {children}
        <Punctuation>:</Punctuation>
      </span>
    </span>
  );
}
