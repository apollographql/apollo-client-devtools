import { cva } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { useMemo } from "react";
import { CardProvider } from "./CardContext";
import { twMerge } from "tailwind-merge";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  variant?: "filled" | "outline" | "unstyled";
}

const card = cva(
  [
    "flex",
    "flex-col",
    "rounded-lg",
    "relative",
    "min-w-0",
    "break-words",
    "has-[[data-card-element=body]>table]:overflow-hidden",
  ],
  {
    variants: {
      variant: {
        filled: [],
        outline: [
          "border",
          "border-primary",
          "dark:border-primary-dark",
          "shadow-cards",
        ],
        unstyled: [],
      },
    },
  }
);

export function Card({ children, className, variant = "outline" }: CardProps) {
  const context = useMemo(() => ({ variant }), [variant]);

  return (
    <CardProvider value={context}>
      <div className={twMerge(card({ variant }), className)}>{children}</div>
    </CardProvider>
  );
}
