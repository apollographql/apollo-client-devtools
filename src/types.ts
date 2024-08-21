import type { ApolloClient as ApolloClient4 } from "@apollo/client";
import type { ApolloClient as ApolloClient3 } from "@apollo/client-3";
import type { ExplorerResponse as EmbeddedExplorerResponse } from "./application/components/Explorer/postMessageHelpers";

export type ApolloClient = ApolloClient3<any> | ApolloClient4;

export interface ExplorerResponse {
  operationName: string | undefined;
  response: EmbeddedExplorerResponse;
}

export { EmbeddedExplorerResponse };

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

// This is copied from `@apollo/client` since it is not exported
export interface ErrorCodes {
  [key: number]: { file: string; condition?: string; message?: string };
}

export interface SerializedError {
  message: string;
  name: string;
  stack?: string;
}

export type MemoryInternals = ReturnType<
  NonNullable<ApolloClient["getMemoryInternals"]>
>;
