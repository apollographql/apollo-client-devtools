import type { ReactNode } from "react";
import IconStatusDot from "@apollo/icons/default/IconStatusDot.svg";
import { cva } from "class-variance-authority";

interface StatusBadgeProps {
  color: "green" | "red" | "purple";
  children?: ReactNode;
}

const icon = cva(["size-4"], {
  variants: {
    color: {
      green: ["text-icon-success dark:text-icon-success-dark"],
      red: ["text-icon-error dark:text-icon-error-dark"],
      purple: ["text-icon-beta dark:text-icon-beta-dark"],
    },
  },
});

export function StatusBadge({ children, color }: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <IconStatusDot className={icon({ color })} />
      {children}
    </span>
  );
}
