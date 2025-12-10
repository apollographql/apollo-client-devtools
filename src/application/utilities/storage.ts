import { Trie } from "@wry/trie";
import browser from "webextension-polyfill";
import {
  decoratePromise,
  type DecoratedPromise,
  type FulfilledPromise,
} from "./promises";

const cache = new Trie<{ promise?: DecoratedPromise<any> }>(true);

export interface LocalStorage {
  cacheWriteLimit: number;
}

export const DEFAULTS = {
  cacheWriteLimit: 500,
} as const;

export function getItemSync<TKey extends keyof LocalStorage>(key: TKey) {
  const item = cache.lookup(key);
  const promise = item.promise as
    | DecoratedPromise<LocalStorage[TKey]>
    | undefined;

  if (promise && promise.status === "fulfilled") {
    return promise.value;
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

function createResolvedPromise<T>(value: T): FulfilledPromise<T> {
  const promise = Promise.resolve(value) as FulfilledPromise<T>;

  promise.status = "fulfilled";
  promise.value = value;

  return promise;
}
