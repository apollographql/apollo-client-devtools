import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { forwardRef, type ElementType, type ReactNode } from "react";
import type { OmitNull } from "../types/utils";
import IconErrorSolid from "@apollo/icons/large/IconErrorSolid.svg";
import { twMerge } from "tailwind-merge";

type Variants = OmitNull<Required<VariantProps<typeof alert>>>;

export interface AlertProps extends Variants {
  as?: "button" | "div";
  children?: ReactNode;
  className?: string;
}

const alert = cva(
  ["px-4", "py-3", "border-l-4", "rounded", "flex", "gap-2", "items-start"],
  {
    variants: {
      variant: {
        error: [
          "border-l-error",
          "dark:border-l-error-dark",
          "bg-error",
          "dark:bg-error-dark",
          "text-error",
          "dark:text-error-dark",
        ],
      },
    },
  }
);

const ICONS: Record<Variants["variant"], ElementType> = {
  error: IconErrorSolid,
};

export const Alert = forwardRef<HTMLDivElement | HTMLButtonElement, AlertProps>(
  ({ as: Element = "div", children, className, variant, ...props }, ref) => {
    const Icon = ICONS[variant];

    return (
      <Element
        {...props}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        className={twMerge(alert({ variant }), className)}
      >
        <Icon className="size-6" />
        <div className="flex-1 font-body text-md font-normal">{children}</div>
      </Element>
    );
  }
);
