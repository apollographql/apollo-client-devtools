import { ApolloClient, ApolloLink, InMemoryCache, gql } from "@apollo/client";
import {
  ApolloClient as ApolloClient3,
  ApolloLink as ApolloLink3,
  InMemoryCache as InMemoryCache3,
} from "@apollo/client-3";
import type { ApolloClient as AnyApolloClient } from "@/types";
import { createCacheTimings, untimed } from "../cacheTimings";
import { createHandler } from "../helpers";

const QUERY = gql`
  query Colors {
    colors {
      id
      name
    }
  }
`;

const FRAGMENT = gql`
  fragment ColorFields on Color {
    id
    name
  }
`;

const data = { colors: [{ __typename: "Color", id: "1", name: "red" }] };

const versions: Array<[string, () => AnyApolloClient]> = [
  [
    "v4",
    () =>
      new ApolloClient({
        cache: new InMemoryCache(),
        link: ApolloLink.empty(),
      }),
  ],
  [
    "v3",
    () =>
      new ApolloClient3({
        cache: new InMemoryCache3(),
        link: ApolloLink3.empty(),
      }),
  ],
];

describe.each(versions)("createCacheTimings (%s)", (_, createClient) => {
  test("records writes, diffs and broadcasts per document", () => {
    const client = createClient();
    const cache = client.cache as InMemoryCache;
    const timings = createCacheTimings(client);

    cache.watch({
      query: QUERY,
      optimistic: true,
      callback: () => {},
    });
    cache.writeQuery({ query: QUERY, data });
    cache.writeFragment({
      fragment: FRAGMENT,
      data: { __typename: "Color", id: "1", name: "blue" },
    });

    const { broadcastWatches, operations } = timings.snapshot();
    const query = operations.find(({ key }) => key === "query Colors")!;
    const fragment = operations.find(
      ({ key }) => key === "fragment ColorFields"
    )!;

    expect(query.write.count).toBe(1);
    expect(query.diff.count).toBeGreaterThanOrEqual(1);
    expect(fragment.write.count).toBe(1);
    expect(broadcastWatches.count).toBe(2);

    // Writes broadcast watches, which diff each watch, so self time excludes
    // the nested calls
    expect(query.write.selfMs).toBeLessThanOrEqual(query.write.totalMs);
    expect(broadcastWatches.selfMs).toBeLessThanOrEqual(
      broadcastWatches.totalMs
    );

    timings.dispose();
  });

  test("restores the original methods on dispose", () => {
    const client = createClient();
    const cache = client.cache as any;
    const { write, diff, broadcastWatches } = cache;

    const timings = createCacheTimings(client);

    expect(cache.write).not.toBe(write);

    timings.dispose();

    expect(cache.write).toBe(write);
    expect(cache.diff).toBe(diff);
    expect(cache.broadcastWatches).toBe(broadcastWatches);
  });

  test("does not record cache reads made by the devtools", () => {
    const client = createClient();
    const cache = client.cache as InMemoryCache;
    const handler = createHandler(client);

    cache.writeQuery({ query: QUERY, data });
    const subscriptions = Array.from({ length: 10 }, () =>
      (client as ApolloClient)
        .watchQuery({ query: QUERY, fetchPolicy: "cache-only" })
        .subscribe(() => {})
    );

    const timings = createCacheTimings(client);
    const diffCount = () =>
      timings
        .snapshot()
        .operations.reduce((sum, operation) => sum + operation.diff.count, 0);

    // Used for the query count shown in the devtools tabs, polled every 500ms
    expect(handler.getQueryCount()).toBe(10);
    expect(diffCount()).toBe(0);

    // Used by the Queries tab, which diffs each query to show its cached data
    expect(untimed(() => handler.getQueries())).toHaveLength(10);
    expect(diffCount()).toBe(0);

    timings.dispose();
    subscriptions.forEach((subscription) => subscription.unsubscribe());
  });
});
