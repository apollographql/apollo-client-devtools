/// <reference types="@emotion/react/types/css-prop" />

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
