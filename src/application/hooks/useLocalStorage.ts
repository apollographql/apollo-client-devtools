import { use, useCallback, useReducer } from "react";
import { Trie } from "@wry/trie";
import browser from "webextension-polyfill";

interface Storage {
  cacheWriteLimit: number;
}

const DEFAULTS = {
  cacheWriteLimit: 500,
} as const;

const cache = new Trie<{ promise?: Promise<any> }>(true);

function getItem<TKey extends keyof Storage>(
  key: TKey
): Promise<Storage[TKey] | undefined> {
  const item = cache.lookup(key);

  if (!item.promise) {
    item.promise = browser.storage.local.get(key).then((result) => result[key]);
  }

  return item.promise;
}

async function setItem<TKey extends keyof Storage>(
  key: TKey,
  value: Storage[TKey]
) {
  await browser.storage.local.set({ [key]: value });
  const item = cache.lookup(key);

  item.promise = createResolvedPromise(value);
}

function createResolvedPromise<T>(value: T): Promise<T> {
  const promise = Promise.resolve(value);

  (promise as any).status = "fulfilled";
  (promise as any).value = value;

  return promise;
}

export function useLocalStorage<TKey extends keyof Storage>(key: TKey) {
  const [, rerender] = useReducer((c) => c + 1, 0);

  const set = useCallback(
    async (value: Storage[TKey]) => {
      await setItem(key, value);
      rerender();
    },
    [key]
  );

  return [use(getItem(key)) ?? DEFAULTS[key], set] as const;
}
