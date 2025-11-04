import { clsx } from "clsx";

interface Props {
  className?: string;
}

export function UndefinedNode({ className }: Props) {
  return (
    <span className={clsx("text-[var(--ov-typeUndefined-color)]", className)}>
      undefined
    </span>
  );
}
