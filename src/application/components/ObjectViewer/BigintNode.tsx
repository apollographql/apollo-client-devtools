interface Props {
  value: bigint;
}

export function BigintNode({ value }: Props) {
  return (
    <span className="text-[var(--ov-typeBigint-color,var(--ov-typeNumber-color))]">
      {String(value)}n
    </span>
  );
}
