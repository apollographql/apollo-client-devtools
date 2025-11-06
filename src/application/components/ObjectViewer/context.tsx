import { equal } from "@wry/equality";
import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";

interface ContextType {
  displayObjectSize: boolean;
  collapsed: number | boolean;
  getTypeOf?: (value: unknown) => string | undefined;
  renderers: Record<
    string,
    (
      props: Record<string, any> & {
        DefaultRender: (props: object) => ReactNode;
      }
    ) => ReactNode
  >;
}

const Context = createContext<ContextType>({
  collapsed: 1,
  displayObjectSize: true,
  renderers: {},
});

export const useObjectViewerContext = () => useContext(Context);

export function useContextValueFallback<TKey extends keyof ContextType>(
  key: TKey,
  propValue: ContextType[TKey] | undefined
): ContextType[TKey] {
  const ctx = useObjectViewerContext();

  return propValue ?? ctx[key];
}

export function Provider({
  children,
  collapsed,
  getTypeOf,
  renderers,
  displayObjectSize,
}: { children?: ReactNode } & ContextType) {
  const parent = useObjectViewerContext();
  const ctx: ContextType = {
    collapsed,
    displayObjectSize,
    getTypeOf: getTypeOf ?? parent.getTypeOf,
    renderers: { ...parent.renderers, ...renderers },
  };
  const ref = useRef(ctx);

  if (!equal(ctx, ref.current)) {
    ref.current = ctx;
  }

  return <Context.Provider value={ref.current}>{children}</Context.Provider>;
}
