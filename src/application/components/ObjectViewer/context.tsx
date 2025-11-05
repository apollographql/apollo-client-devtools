import { equal } from "@wry/equality";
import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";
import { getTypeOf } from "./getTypeOf";

interface ContextType {
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
  renderers: {},
});

export const useObjectViewerContext = () => useContext(Context);
export const useTypeOfValue = (value: unknown) => {
  const ctx = useObjectViewerContext();

  return ctx.getTypeOf?.(value) ?? getTypeOf(value);
};

export function Provider({
  children,
  getTypeOf,
  renderers,
}: { children?: ReactNode } & ContextType) {
  const parent = useObjectViewerContext();
  const ctx: ContextType = {
    getTypeOf: getTypeOf ?? parent.getTypeOf,
    renderers: { ...parent.renderers, ...renderers },
  };
  const ref = useRef(ctx);

  if (!equal(ctx, ref.current)) {
    ref.current = ctx;
  }

  return <Context.Provider value={ref.current}>{children}</Context.Provider>;
}
