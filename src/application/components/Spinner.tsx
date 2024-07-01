import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

type Variants = VariantProps<typeof spinner>;

interface SpinnerProps extends Variants {
  className?: string;
}

const spinner = cva(
  ["border-2", "inline-block", "rounded-full", "animate-spin"],
  {
    variants: {
      variant: {
        default: [
          "border-info",
          "border-b-primary",
          "border-l-primary",
          "dark:border-info-dark",
          "dark:border-b-primary-dark",
          "dark:border-l-primary-dark",
        ],
        neutral: [
          "border-current",
          "border-b-transparent",
          "border-b-transparent",
        ],
      },
      size: {
        tiny: ["size-3"],
        xs: ["size-4"],
        sm: ["size-6"],
        md: ["size-8"],
        lg: ["size-10"],
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export function Spinner({ className, size, variant }: SpinnerProps) {
  return <div className={twMerge(spinner({ size, variant }), className)} />;
}
