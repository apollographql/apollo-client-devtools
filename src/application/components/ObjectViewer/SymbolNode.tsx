interface Props {
  value: symbol;
}

export function SymbolNode({ value }: Props) {
  return (
    <span className="text-[var(--ov-typeSymbol-color)]">
      {value.toString()}
    </span>
  );
}
