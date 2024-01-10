import type { ComponentPropsWithoutRef, ElementType } from "react";
import { ExtendProps } from "./props";

type AsProp<TElement extends ElementType> = {
  as?: TElement;
};

export type PolymorphicComponentProps<
  TElement extends ElementType,
  Props,
> = ExtendProps<ComponentPropsWithoutRef<TElement>, Props & AsProp<TElement>>;
