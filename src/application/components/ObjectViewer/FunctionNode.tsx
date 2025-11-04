import clsx from "clsx";

interface Props {
  className?: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  value: Function;
}

export function FunctionNode({ className, value }: Props) {
  return (
    <span className={clsx("text-[var(--ov-typeFunction-color)]", className)}>
      {value.toString()}
    </span>
  );
}
