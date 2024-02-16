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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NoInfer<T> = [T][T extends any ? 0 : never];
