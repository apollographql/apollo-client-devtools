import { Trie } from "@wry/trie";
import browser from "webextension-polyfill";
import {
  createResolvedPromise,
  decoratePromise,
  type DecoratedPromise,
} from "./promises";

const cache = new Trie<{ promise?: DecoratedPromise<any> }>(true);

export interface LocalStorage {
  autoRecordCacheWrites: boolean;
  cacheWriteLimit: number;
}

export const DEFAULTS = {
  autoRecordCacheWrites: false,
  cacheWriteLimit: 500,
} as const satisfies Partial<LocalStorage>;

export function getItemSync<TKey extends keyof LocalStorage>(key: TKey) {
  const item = cache.lookup(key);
  const promise = item.promise as
    | DecoratedPromise<LocalStorage[TKey]>
    | undefined;

  if (promise && promise.status === "fulfilled") {
    return promise.value;
  } else if (!promise) {
    // prime the cache for the next time we call `getItemSync` in case
    // `getItemSync` is called before `getItem`
    void getItem(key);
  }

  return DEFAULTS[key];
}

export function getItem<TKey extends keyof LocalStorage>(
  key: TKey
): Promise<LocalStorage[TKey] | undefined> {
  const item = cache.lookup(key);

  if (!item.promise) {
    item.promise = decoratePromise(
      browser.storage.local.get(key).then((result) => result[key])
    );
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
