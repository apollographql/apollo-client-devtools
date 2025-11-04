import clsx from "clsx";

interface Props {
  className?: string;
  value: boolean;
}

export function BooleanNode({ className, value }: Props) {
  return (
    <span className={clsx("text-[var(--ov-typeBoolean-color)]", className)}>
      {String(value)}
    </span>
  );
}
