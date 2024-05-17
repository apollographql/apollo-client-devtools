import type { ReactNode } from "react";
import IconStatusDot from "@apollo/icons/default/IconStatusDot.svg";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { OmitNull } from "../types/utils";
import { twMerge } from "tailwind-merge";

interface StatusBadgeProps extends IconVariants, ContainerVariants {
  className?: string;
  children?: ReactNode;
}

type IconVariants = Required<OmitNull<VariantProps<typeof icon>>>;
type ContainerVariants = Required<OmitNull<VariantProps<typeof container>>>;

const container = cva(
  [
    "inline-flex",
    "items-center",
    "font-normal",
    "font-normal",
    "text-md",
    "gap-2",
  ],
  {
    variants: {
      variant: {
        rounded: [
          "py-1",
          "px-3",
          "rounded-[100px]",
          "border",
          "border-primary",
          "bg-primary",
          "dark:border-primary-dark",
          "dark:bg-primary-dark",
        ],
        hidden: [],
      },
    },
  }
);

const icon = cva(["size-4"], {
  variants: {
    color: {
      blue: ["text-icon-info", "text-icon-info-dark"],
      gray: ["text-icon-secondary", "dark:text-icon-secondary-dark"],
      green: ["text-icon-success", "dark:text-icon-success-dark"],
      navy: ["text-icon-disabled", "dark:text-icon-disabled-dark"],
      purple: ["text-icon-beta", "dark:text-icon-beta-dark"],
      red: ["text-icon-error", "dark:text-icon-error-dark"],
      yellow: ["text-icon-change", "dark:text-icon-change-dark"],
    },
  },
});

export function StatusBadge({
  className,
  children,
  color,
  variant,
}: StatusBadgeProps) {
  return (
    <span className={twMerge(container({ variant }), className)}>
      <IconStatusDot className={icon({ color })} />
      {children}
    </span>
  );
}
