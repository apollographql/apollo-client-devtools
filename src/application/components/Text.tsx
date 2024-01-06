import { PolymorphicComponentProps } from "../types/PolymorphicComponent";
import { clsx } from "clsx";

type TextProps<TElement extends React.ElementType = "span"> =
  PolymorphicComponentProps<
    TElement,
    {
      type?: "3xl" | "2xl" | "xl" | "lg" | "md" | "base" | "sm" | "xs" | "code";
    }
  >;

export function Text<TElement extends React.ElementType = "span">({
  as,
  className,
  children,
  type,
  ...rest
}: TextProps<TElement>) {
  const Element = as || "span";

  return (
    <Element
      className={clsx(className, {
        ["text-3xl font-heading font-medium"]: type === "3xl",
      })}
      {...rest}
    >
      {children}
    </Element>
  );
}
