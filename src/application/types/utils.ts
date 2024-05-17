export type OmitNull<T> = T extends object
  ? {
      [K in keyof T]: Exclude<T[K], null>;
    }
  : Exclude<T, null>;

declare const __brand: unique symbol;

export type Brand<K, T> = K & { [__brand]: T };
