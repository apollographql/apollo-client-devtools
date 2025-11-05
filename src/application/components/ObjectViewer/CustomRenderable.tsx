import { useCallback, type ReactNode } from "react";
import { useObjectViewerContext } from "./context";
import type { getTypeOf } from "./getTypeOf";
import type { RenderableTypeProps } from "./ObjectViewer";

type MergePropsFn<ParentProps, Props> = (
  parentProps: ParentProps,
  props: Partial<Props>
) => ParentProps;

export type CustomRenderableComponent<Props, _DefaultRenderProps = Props> = (
  parentProps: Props
) => ReactNode;

export type WithDefaultRender<
  Component extends CustomRenderableComponent<any, any>,
> =
  Component extends CustomRenderableComponent<
    infer Props,
    infer DefaultRenderProps
  >
    ? (
        props: Props & {
          DefaultRender: (props: Partial<DefaultRenderProps>) => ReactNode;
        }
      ) => ReactNode
    : never;

export function customRenderable<
  Props extends Record<string, any>,
  DefaultRenderProps = Props,
>(
  type: string,
  BaseComponent: (props: Props) => ReactNode,
  mergeProps: MergePropsFn<Props, DefaultRenderProps> = (
    parentProps,
    props
  ) => ({
    ...parentProps,
    ...props,
  })
): CustomRenderableComponent<Props, DefaultRenderProps> {
  return function Component(parentProps: Props) {
    const ctx = useObjectViewerContext();
    const DefaultRender = useCallback(
      (props: Partial<DefaultRenderProps>) => (
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
  return customRenderable(
    type,
    BaseComponent,
    (
      parentProps,
      props: Partial<Omit<RenderableTypeProps<T>, "depth" | "path">>
    ) => ({
      ...parentProps,
      ...props,
      depth: parentProps.depth,
      path: parentProps.path,
      context: { ...parentProps.context, ...props.context },
    })
  );
}
