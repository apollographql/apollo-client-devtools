interface Props {
  value: boolean;
}

export function BooleanNode({ value }: Props) {
  return (
    <span className="text-[var(--ov-typeBoolean-color)]">{String(value)}</span>
  );
}
