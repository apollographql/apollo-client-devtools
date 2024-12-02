import IconInfo from "@apollo/icons/default/IconInfo.svg";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { OmitNull } from "../types/utils";
import { twMerge } from "tailwind-merge";
import type { ElementType, ReactNode } from "react";

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

const VARIANTS: Record<
  Variants["variant"],
  { title: string; icon: ElementType }
> = {
  note: {
    title: "Note",
    icon: IconInfo,
  },
};

export function Admonition({ children, className, variant }: AdmonitionProps) {
  const { title, icon: Icon } = VARIANTS[variant];

  return (
    <aside className={twMerge(admonition({ variant }), className)}>
      <div className="flex gap-1 items-center">
        <Icon className="size-4" />{" "}
        <span className="uppercase font-semibold">{title}</span>
      </div>
      <p className="mt-1">{children}</p>
    </aside>
  );
}
