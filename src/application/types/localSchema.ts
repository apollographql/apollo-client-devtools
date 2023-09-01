type JSONPrimitive = string | number | null | boolean;
type JSONValue = JSONPrimitive | JSONValue[] | { [key: string]: JSONValue };

export interface Query {
  cache: JSON | null;
  mutation: Mutation | null;
  mutationLog: {
    count: number;
    mutations: Mutation[];
  };
  watchedQueries: {
    count: number;
    watchedQueries: WatchedQuery[];
  };
  watchedQuery: WatchedQuery | null;
}

export interface WatchedQuery {
  __typename: "WatchedQuery";
  id: number;
  name: string;
  queryString: string;
  cachedData?: Record<string, JSONValue>;
  variables: Record<string, JSONValue>;
}

export interface Mutation {
  __typename: "Mutation";
  id: number;
  name: string;
  mutationString: string;
}
