export type OmitNull<T> = T extends object
  ? {
      [K in keyof T]: Exclude<T[K], null>;
    }
  : Exclude<T, null>;
