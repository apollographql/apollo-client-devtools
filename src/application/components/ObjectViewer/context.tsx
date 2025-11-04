import { equal } from "@wry/equality";
import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";
import type { Renderer } from "./ObjectViewer";

interface ContextType {
  renderers: Record<string, Renderer<any>>;
}

const Context = createContext<ContextType>({ renderers: {} });

export const useObjectViewerContext = () => useContext(Context);

export function Provider({
  children,
  renderers,
}: { children?: ReactNode } & ContextType) {
  const ctx: ContextType = { renderers };
  const ref = useRef(ctx);

  if (!equal(ctx, ref.current)) {
    ref.current = ctx;
  }

  return <Context.Provider value={ref.current}>{children}</Context.Provider>;
}
