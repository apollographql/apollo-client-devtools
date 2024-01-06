import type { ComponentPropsWithoutRef, ElementType } from "react";

type ExtendProps<ExtendedProps, OverrideProps> = OverrideProps &
  Omit<ExtendedProps, keyof OverrideProps>;

type AsProp<TElement extends ElementType> = {
  as?: TElement;
};

export type PolymorphicComponentProps<
  TElement extends ElementType,
  Props,
> = ExtendProps<ComponentPropsWithoutRef<TElement>, Props & AsProp<TElement>>;
