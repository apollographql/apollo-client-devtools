export type ExtendProps<ExtendedProps, OverrideProps> = OverrideProps &
  Omit<ExtendedProps, keyof OverrideProps>;
