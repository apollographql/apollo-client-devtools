import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

interface DividerProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

const divider = cva(
  ["border-0", "border-primary", "dark:border-primary-dark"],
  {
    variants: {
      orientation: {
        horizontal: ["border-b", "w-full"],
        vertical: ["border-l", "h-full"],
      },
    },
  }
);

export const Divider = ({
  className,
  orientation = "horizontal",
}: DividerProps) => {
  return <hr className={twMerge(divider({ orientation }), className)} />;
};
