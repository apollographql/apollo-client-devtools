import IconChevronDown from "@apollo/icons/default/IconChevronDown.svg";
import { clsx } from "clsx";

interface Props {
  className?: string;
  collapsed: boolean;
}

export function Arrow({ className, collapsed }: Props) {
  return (
    <IconChevronDown
      className={clsx(
        "block size-4 transition-transform ease-out absolute -left-[2ch] top-1/2 -translate-y-1/2 text-[var(--ov-arrow-color,var(--ov-punctuation-color))]",
        { "-rotate-90": collapsed },
        className
      )}
    />
  );
}
