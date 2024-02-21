import { ApolloQueryResult } from "@apollo/client";

export type QueryResult = ApolloQueryResult<any>;

export interface ExplorerResponse {
  operationName: string | undefined;
  response: QueryResult;
}

export interface MessageObj<TPayload = any> {
  to?: string;
  message: string;
  payload: TPayload;
}

export type CustomEventListener<T = any> = (message: MessageObj<T>) => void;

// Alias `any` in places that we are safe to use it (like an constraint) without
// the need to disable eslint rules.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SafeAny = any;
