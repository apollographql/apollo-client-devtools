import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cloneElement, forwardRef, isValidElement } from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import type { AsChildProps } from "../types/props";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { OmitNull } from "../types/utils";
import { Spinner } from "./Spinner";

type NativeButtonProps = ComponentPropsWithoutRef<"button">;

export type ButtonProps = AsChildProps<NativeButtonProps> &
  Variants & {
    className?: string;
    icon?: ReactElement<{ "aria-hidden": boolean; className?: string }>;
    loading?: boolean;
    loadingText?: string;
  };

type Variants = OmitNull<Required<VariantProps<typeof button>>>;

const button = cva(
  [
    "flex",
    "items-center",
    "flex",
    "gap-2",
    "outline-none",
    "focus:ring-3",
    "focus:ring-offset-3",
    "focus:ring-offset-primary",
    "focus:dark:ring-offset-primary-dark",
    "focus:ring-focused",
    "focus:dark:ring-focused-dark",
    "disabled:bg-button-disabled",
    "disabled:dark:bg-button-disabled-dark",
    "disabled:text-disabled",
    "disabled:dark:text-disabled-dark",
    "disabled:cursor-not-allowed",
    "transition-colors",
    "duration-200",
  ],
  {
    variants: {
      variant: {
        hidden: [
          "text-primary",
          "dark:text-primary-dark",
          "hover:bg-button-secondaryHover",
          "hover:dark:bg-button-secondaryHover-dark",
          "active:bg-button-secondarySelected",
          "active:dark:bg-button-secondarySelected-dark",
        ],
        primary: [
          "text-white",
          "bg-button-primary",
          "dark:bg-button-primary-dark",
          "hover:bg-button-primaryHover",
          "hover:dark:bg-button-primaryHover-dark",
          "active:bg-selected",
          "active:dark:bg-selected-dark",
        ],
        secondary: [
          "text-primary",
          "dark:text-primary-dark",
          "border",
          "bg-button-secondary",
          "dark:bg-button-secondary-dark",
          "border-primary",
          "dark:border-primary-dark",
          "hover:bg-button-secondaryHover",
          "hover:dark:bg-button-secondaryHover-dark",
          "active:bg-selected",
          "active:dark:bg-selected-dark",
        ],
      },
      size: {
        xs: [
          "p-2",
          "rounded",
          "text-sm",
          "font-semibold",
          "has-[>svg:only-child]:p-1.5",
        ],
        sm: [
          "py-2",
          "px-3",
          "rounded",
          "text-sm",
          "font-semibold",
          "has-[>svg:only-child]:p-2",
        ],
        md: [
          "py-2",
          "px-3",
          "rounded-lg",
          "text-md",
          "font-semibold",
          "has-[>svg:only-child]:p-3",
        ],
      },
    },
  }
);

const iconSize = cva([], {
  variants: {
    size: {
      xs: ["w-3"],
      sm: ["w-4"],
      md: ["w-4"],
    },
  },
});

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      asChild,
      className,
      children,
      variant,
      size,
      icon,
      loading,
      loadingText,
      ...props
    },
    ref
  ) {
    const Component = asChild ? Slot : "button";
    const content = loading ? loadingText ?? children : children;

    return (
      <Component
        {...props}
        ref={ref}
        className={twMerge(button({ variant, size }), className)}
        disabled={loading || (props as NativeButtonProps).disabled}
      >
        {loading ? (
          <Spinner size="xs" />
        ) : (
          isValidElement(icon) &&
          cloneElement(icon, {
            "aria-hidden": true,
            className: twMerge(iconSize({ size }), icon.props.className),
          })
        )}
        {asChild ? (
          <Slottable>{content}</Slottable>
        ) : content && isValidElement(icon) ? (
          <span>{content}</span>
        ) : (
          content
        )}
      </Component>
    );
  }
);
