import { ApolloQueryResult } from "@apollo/client";

export type QueryResult = ApolloQueryResult<any>;

export interface GraphiQLResponse {
  operationName: string,
  response: QueryResult
}