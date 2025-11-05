import { useCallback, type ReactNode } from "react";
import { useObjectViewerContext } from "./context";
import type { getTypeOf } from "./getTypeOf";

type ValueProp<T = unknown> = [T] extends [never]
  ? { value?: never }
  : { value: T };
type MergePropsFn<TProps> = (
  parentProps: TProps,
  props: Partial<TProps>
) => TProps;

export type RenderableTypeProps<T = unknown> = {
  className?: string;
  depth: number;
  context: Record<string, any> | undefined;
} & ValueProp<T>;

export function customRenderable<Props extends Record<string, any>>(
  type: string,
  BaseComponent: (props: Props) => ReactNode,
  mergeProps: MergePropsFn<Props> = (parentProps, props) => ({
    ...parentProps,
    ...props,
  })
) {
  return function Component(parentProps: Props) {
    const ctx = useObjectViewerContext();
    const DefaultRender = useCallback(
      (props: Partial<Props>) => (
        <BaseComponent {...mergeProps(parentProps, props)} />
      ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(parentProps)
    );

    const Render = ctx.renderers[type];

    return Render ? (
      <Render {...parentProps} DefaultRender={DefaultRender} />
    ) : (
      <BaseComponent {...parentProps} />
    );
  };
}

export function customRenderableType<T = unknown>(
  type: ReturnType<typeof getTypeOf>,
  BaseComponent: (props: RenderableTypeProps<T>) => ReactNode
) {
  return customRenderable(type, BaseComponent, (parentProps, props) => ({
    ...parentProps,
    ...props,
    context: { ...parentProps.context, ...props.context },
  }));
}
