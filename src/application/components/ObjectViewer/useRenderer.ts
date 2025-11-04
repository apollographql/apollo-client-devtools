import { useMemo } from "react";
import { useObjectViewerContext } from "./context";
import type { Renderer } from "./ObjectViewer";

export function useRenderer(value: unknown): Renderer<unknown> | undefined {
  const { renderers } = useObjectViewerContext();
  const customRenderKey = useMemo(() => {
    return Object.keys(renderers).find((key) => renderers[key]?.is(value));
  }, [value, renderers]);

  if (customRenderKey) {
    return renderers[customRenderKey];
  }
}
