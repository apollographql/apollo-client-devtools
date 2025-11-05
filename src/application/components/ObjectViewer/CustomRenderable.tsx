import { useCallback, type ReactNode } from "react";
import { useObjectViewerContext, useTypeOfValue } from "./context";

type ValueProp<T> = [T] extends [never] ? { value?: never } : { value: T };

export function customRenderable<T = unknown>(
  type: string,
  BaseComponent: (props: {
    className?: string;
    depth: number;
    context: Record<string, any> | undefined;
    value: T;
  }) => ReactNode
) {
  return function Component({
    context,
    className,
    value,
    depth,
  }: {
    context?: Record<string, any> | undefined;
    className?: string;
    depth: number;
  } & ValueProp<T>) {
    const ctx = useObjectViewerContext();
    const valueType = useTypeOfValue(value);

    const DefaultRender = useCallback(
      (props: {
        className?: string;
        context?: Record<string, any>;
        value: T;
      }) => (
        <BaseComponent
          {...props}
          context={{ ...context, ...props.context }}
          depth={depth}
        />
      ),
      [context, depth]
    );

    const Render =
      type === valueType ? ctx.renderers[valueType] : DefaultRender;
    const Component = Render ?? DefaultRender;

    return (
      <Component
        depth={depth}
        context={context}
        className={className}
        value={value as T}
        DefaultRender={DefaultRender as any}
      />
    );
  };
}
