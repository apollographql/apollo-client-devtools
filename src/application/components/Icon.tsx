import { ReactNode } from "react";
import { clsx } from "clsx";

export interface IconProps {
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
}: IconProps) {
  return (
    <svg
      className={clsx(className, "stroke-current")}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      width={SIZES[size]}
      height={SIZES[size]}
    >
      {children}
    </svg>
  );
}
