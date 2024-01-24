import { ComponentPropsWithoutRef, ReactNode } from "react";
import { clsx } from "clsx";

export interface IconProps extends ComponentPropsWithoutRef<"svg"> {
  className?: string;
  children: ReactNode;
  size?: "large" | "default" | "small";
  viewBox: string;
}

const SIZES = {
  large: 24,
  default: 16,
  small: 12,
} as const satisfies Record<NonNullable<IconProps["size"]>, number>;

export function Icon({
  className,
  children,
  size = "default",
  viewBox,
  ...props
}: IconProps) {
  return (
    <svg
      {...props}
      className={clsx(className, "stroke-current fill-none")}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      width={SIZES[size]}
      height={SIZES[size]}
    >
      {children}
    </svg>
  );
}
