import type { ComponentPropsWithoutRef, ElementType } from "react";
import { useCallback, useRef, type ReactNode } from "react";
import { useObjectViewerContext } from "./context";
import type { getTypeOf } from "./getTypeOf";
import type { RenderableTypeProps } from "./ObjectViewer";
import { equal } from "@wry/equality";

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
    const ref = useRef(parentProps);

    if (!equal(parentProps, ref.current)) {
      ref.current = parentProps;
    }

    const DefaultRender = useCallback(
      (props: Partial<DefaultRenderProps>) => (
        <BaseComponent {...mergeProps(ref.current, props)} />
      ),
      []
    );

    const Render = ctx.renderers[type];

    return Render ? (
      <Render {...parentProps} DefaultRender={DefaultRender} />
    ) : (
      <BaseComponent {...parentProps} />
    );
  };
}

export function customRenderableType<
  T,
  Props extends Record<string, any> = RenderableTypeProps<T>,
>(
  type: ReturnType<typeof getTypeOf>,
  BaseComponent: (props: Props & RenderableTypeProps<T>) => ReactNode
) {
  return customRenderable(
    type,
    BaseComponent,
    (parentProps, props: Partial<Omit<Props, "depth" | "path">>) => ({
      ...parentProps,
      ...props,
      depth: parentProps.depth,
      path: parentProps.path,
      context: { ...parentProps.context, ...props.context },
    })
  );
}

export function filterForwardedElementProps<Element extends ElementType>(
  props: ComponentPropsWithoutRef<Element> & Partial<RenderableTypeProps<any>>
) {
  const { context, depth, value, path, objectKey, ...rest } = props;

  return rest;
}
