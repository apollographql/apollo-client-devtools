import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { OmitNull } from "../types/utils";
import { twMerge } from "tailwind-merge";
import type { ReactNode } from "react";

type Variants = OmitNull<Required<VariantProps<typeof admonition>>>;

interface AdmonitionProps extends Variants {
  children?: ReactNode;
  className?: string;
}

const admonition = cva(["border-l-4", "pl-4"], {
  variants: {
    variant: {
      note: ["border-l-gray-400"],
    },
  },
});

export function Admonition({ children, className, variant }: AdmonitionProps) {
  return (
    <aside className={twMerge(admonition({ variant }), className)}>
      <p>{children}</p>
    </aside>
  );
}
