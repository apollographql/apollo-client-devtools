interface Props {
  // eslint-disable-next-line @typescript-eslint/ban-types
  value: Function;
}

export function FunctionNode({ value }: Props) {
  return (
    <span className="text-[var(--ov-typeFunction-color)]">
      {value.toString()}
    </span>
  );
}
