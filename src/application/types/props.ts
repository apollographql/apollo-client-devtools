export type ExtendProps<ExtendedProps, OverrideProps> = OverrideProps &
  Omit<ExtendedProps, keyof OverrideProps>;

export type AsChildProps<DefaultElementProps> =
  | ({ asChild?: false } & DefaultElementProps)
  | { asChild: true; children: React.ReactNode };
