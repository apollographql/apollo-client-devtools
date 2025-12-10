import { use, useCallback, useReducer } from "react";
import type { LocalStorage } from "../utilities/storage";
import { DEFAULTS, getItem, setItem } from "../utilities/storage";

export function useLocalStorage<TKey extends keyof LocalStorage>(key: TKey) {
  const [, rerender] = useReducer((c) => c + 1, 0);

  const set = useCallback(
    async (value: LocalStorage[TKey]) => {
      await setItem(key, value);
      rerender();
    },
    [key]
  );

  return [use(getItem(key)) ?? DEFAULTS[key], set] as const;
}
