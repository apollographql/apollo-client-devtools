import clsx from "clsx";

interface Props {
  className?: string;
  value: symbol;
}

export function SymbolNode({ className, value }: Props) {
  return (
    <span className={clsx("text-[var(--ov-typeSymbol-color)]", className)}>
      {value.toString()}
    </span>
  );
}
