import { forwardRef, type ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { OmitNull } from "../types/utils";

interface BadgeProps extends Variants {
  className?: string;
  children: ReactNode;
}

type Variants = OmitNull<Required<VariantProps<typeof badge>>>;

const badge = cva(
  ["rounded-sm", "py-0.5", "px-1", "uppercase", "font-bold", "text-xs"],
  {
    variants: {
      variant: {
        info: [
          "bg-info",
          "text-info",
          "dark:bg-info-dark",
          "dark:text-info-dark",
        ],
        success: [
          "bg-success",
          "text-success",
          "dark:bg-success-dark",
          "dark:text-success-dark",
        ],
        error: [
          "bg-error",
          "text-error",
          "dark:bg-error-dark",
          "dark:text-error-dark",
        ],
        beta: [
          "bg-beta",
          "text-beta",
          "dark:bg-beta-dark",
          "dark:text-beta-dark",
        ],
        warning: [
          "bg-warning",
          "text-warning",
          "dark:bg-warning-dark",
          "dark:text-warning-dark",
        ],
        neutral: [
          "bg-neutral",
          "text-neutral",
          "dark:bg-neutral-dark",
          "dark:text-neutral-dark",
        ],
        primary: [
          "bg-primary",
          "text-primary",
          "dark:bg-primary-dark",
          "dark:text-primary-dark",
        ],
        brand: [
          "bg-primary",
          "text-primary",
          "dark:bg-primary-dark",
          "dark:text-primary-dark",
          "border",
          "border-brand-horizon",
        ],
      },
    },
  }
);

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, children, variant }, ref) => {
    return (
      <span className={twMerge(badge({ variant }), className)} ref={ref}>
        {children}
      </span>
    );
  }
);
