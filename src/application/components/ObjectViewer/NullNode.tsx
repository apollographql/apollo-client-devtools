import { clsx } from "clsx";

interface Props {
  className?: string;
}

export function NullNode({ className }: Props) {
  return (
    <span className={clsx("text-[var(--ov-typeNull-color)]", className)}>
      null
    </span>
  );
}
