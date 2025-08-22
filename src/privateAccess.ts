import type { ApolloClient, ObservableQuery } from "@apollo/client";
import type {
  ApolloClient as ApolloClient3,
  ObservableQuery as ObservableQuery3,
} from "@apollo/client-3";
import type { InternalTypes } from "@apollo/client";

type QueryInfo = import("@apollo/client-3/core/QueryInfo").QueryInfo;

type KnownPrivates = [
  [
    ApolloClient,
    {
      queryManager: InternalTypes.QueryManager;
    },
  ],
  [
    ApolloClient3<any>,
    {
      queryManager: import("@apollo/client-3/core/QueryManager").QueryManager<any>;
    },
  ],
  [
    ObservableQuery,
    {
      polllingInfo?: { interval: number; timeout: NodeJS.Timeout };
    },
  ],
  [
    ObservableQuery3,
    {
      queryInfo: QueryInfo;
      pollingInfo?: { interval: number; timeout: NodeJS.Timeout };
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
