import type { ApolloQueryResult } from "@apollo/client";
import type { JSONObject } from "./application/types/json";

export type QueryResult = ApolloQueryResult<any>;

export interface ExplorerResponse {
  operationName: string | undefined;
  response: QueryResult;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NoInfer<T> = [T][T extends any ? 0 : never];

// Alias `any` in places that we are safe to use it (like an constraint) without
// the need to disable eslint rules.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SafeAny = any;

export type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

export interface ApolloClientInfo {
  id: string;
  name: string | undefined;
  version: string;
  queryCount: number;
  mutationCount: number;
}

export interface ConnectorsDebuggingResultPayload {
  operationName: string | null;
  variables: Record<string, unknown> | null;
  query: string;
  debuggingResult: ConnectorsDebuggingResult;
}

export interface ConnectorsDebuggingResult {
  version: string;
  data: ConnectorsDebuggingData[];
}

export interface ConnectorsDebuggingRequest {
  url: string;
  method: string;
  headers: [string, string][];
  body: Body | null;
}

interface SelectionError {
  message: string;
  path: string;
  count: number;
}

export interface Body {
  kind: string;
  content: Content;
}

export type Content = string | JSONObject | JSONObject[] | null | undefined;

export interface SelectionMappingResponse {
  source: string;
  transformed: string;
  result: JSONObject | JSONObject[] | null;
  errors: SelectionError[];
}

export interface ConnectorsDebuggingResponse {
  status: number;
  headers: [string, string][];
  body: Body & {
    selection: SelectionMappingResponse;
  };
}
export interface ConnectorsDebuggingData {
  request: ConnectorsDebuggingRequest | null | undefined;
  response: ConnectorsDebuggingResponse | null | undefined;
}

export interface ConnectorsDebuggingResult {
  version: string;
  data: ConnectorsDebuggingData[];
}
