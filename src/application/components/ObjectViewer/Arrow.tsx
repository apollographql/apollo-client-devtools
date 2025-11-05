import IconChevronRight from "@apollo/icons/default/IconChevronRight.svg";
import { clsx } from "clsx";

interface Props {
  className?: string;
  expanded: boolean;
}

export function Arrow({ className, expanded }: Props) {
  return (
    <IconChevronRight
      className={clsx(
        "block size-4 transition-transform ease-out absolute -left-[2ch] top-1/2 -translate-y-1/2 text-[var(--ov-arrow-color,var(--ov-punctuation-color))]",
        { "rotate-90": expanded },
        className
      )}
    />
  );
}
