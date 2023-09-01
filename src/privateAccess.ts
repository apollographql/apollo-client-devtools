import type { ApolloClient, ObservableQuery } from "@apollo/client";
import type { QueryInfo } from "@apollo/client/core/QueryInfo";
import type { QueryManager } from "@apollo/client/core/QueryManager";

type KnownPrivates = [
  [
    ApolloClient<any>,
    {
      queryManager: QueryManager<any>;
    },
  ],
  [
    ObservableQuery,
    {
      queryInfo: QueryInfo;
    },
  ],
];

export type WithPrivateAccess<U> = U extends infer T
  ? T extends undefined
    ? undefined
    : KnownPrivates[number] extends infer Known
    ? Known extends [T, infer Overrides]
      ? Omit<T, keyof Overrides> & Overrides
      : never
    : never
  : never;

export function getPrivateAccess<T>(t: T): WithPrivateAccess<T> {
  return t as any;
}
