export type FunctionKeys<T extends object> = keyof {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K];
};
