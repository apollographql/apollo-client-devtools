import { Trie } from "@wry/trie";
import browser from "webextension-polyfill";

const cache = new Trie<{ promise?: Promise<any> }>(true);

export interface LocalStorage {
  cacheWriteLimit: number;
}

export const DEFAULTS = {
  cacheWriteLimit: 500,
} as const;

export function getItem<TKey extends keyof LocalStorage>(
  key: TKey
): Promise<LocalStorage[TKey] | undefined> {
  const item = cache.lookup(key);

  if (!item.promise) {
    item.promise = browser.storage.local.get(key).then((result) => result[key]);
  }

  return item.promise;
}

export async function setItem<TKey extends keyof LocalStorage>(
  key: TKey,
  value: LocalStorage[TKey]
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
