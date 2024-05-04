import type { ComponentPropsWithoutRef, ElementType } from "react";
import { clsx } from "clsx";
import { Slot, Slottable } from "@radix-ui/react-slot";
import type { AsChildProps } from "../types/props";

type NativeButtonProps = ComponentPropsWithoutRef<"button">;

type ButtonSize = "md" | "sm" | "xs";

type ButtonProps = AsChildProps<NativeButtonProps> & {
  className?: string;
  icon?: ElementType;
  variant: "primary" | "secondary" | "hidden";
  size: ButtonSize;
};

const ICON_SIZES = {
  xs: "w-3",
  sm: "w-4",
  md: "w-4",
} satisfies Record<ButtonSize, string>;

export function Button({
  asChild,
  className,
  children,
  variant,
  size,
  icon: Icon,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      {...props}
      className={clsx(
        className,
        "flex items-center gap-2 outline-none",
        "focus:ring-3 focus:ring-offset-3 focus:ring-offset-primary focus:dark:ring-offset-primary-dark focus:ring-focused focus:dark:ring-focused-dark",
        "disabled:bg-button-disabled disabled:dark:bg-button-disabled-dark disabled:text-disabled disabled:dark:text-disabled-dark disabled:cursor-not-allowed",
        {
          "py-2 px-3 rounded-lg text-md font-semibold": size === "md",
          "py-2 px-3 rounded text-sm font-semibold": size === "sm",
          "p-2 rounded text-sm font-semibold": size === "xs",
          "text-white bg-button-primary dark:bg-button-primary-dark hover:bg-button-primaryHover hover:dark:bg-button-primaryHover-dark active:bg-selected active:dark:bg-selected-dark":
            variant === "primary",
          "text-primary dark:text-primary-dark border bg-button-secondary dark:bg-button-secondary-dark border-primary dark:border-primary-dark hover:bg-button-secondaryHover hover:dark:bg-button-secondaryHover-dark active:bg-selected active:dark:bg-selected-dark":
            variant === "secondary",
          "text-primary dark:text-primary-dark hover:bg-button-secondaryHover hover:dark:bg-button-secondaryHover-dark active:bg-selected active:dark:bg-selected-dark":
            variant === "hidden",
        }
      )}
    >
      {Icon && <Icon className={ICON_SIZES[size]} />}
      <Slottable>{children}</Slottable>
    </Component>
  );
}
