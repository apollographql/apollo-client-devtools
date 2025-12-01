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
  const Element = collapsible ? "button" : "span";

  return (
    <Element
      className={clsx("inline-block align-middle relative", {
        "cursor-pointer": collapsible,
      })}
      onClick={collapsible ? onClick : undefined}
    >
      <span className="inline-flex items-center">
        {collapsible && <Arrow collapsed={!!collapsed} />}
        <span>
          {children}
          <Punctuation>:</Punctuation>
        </span>
      </span>
    </Element>
  );
}
