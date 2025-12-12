import { useContextValueFallback } from "./context";
import type { Path } from "./types";

interface Options {
  context: Record<string, unknown> | undefined;
  depth: number;
  displayObjectSize: boolean | undefined;
  path: Path;
  value: unknown;
}

export function useDisplayObjectSize({
  context,
  depth,
  displayObjectSize: displayObjectSizeOverride,
  value,
  path,
}: Options) {
  const displayObjectSize = useContextValueFallback(
    "displayObjectSize",
    displayObjectSizeOverride
  );

  if (typeof displayObjectSize === "function") {
    return displayObjectSize({
      context,
      defaultDisplayObjectSize: true,
      depth,
      value,
      path,
    });
  }

  return typeof displayObjectSize === "number"
    ? depth >= displayObjectSize
    : displayObjectSize;
}
