import { ApolloClient, ApolloLink, InMemoryCache, gql } from "@apollo/client";
import {
  ApolloClient as ApolloClient3,
  ApolloLink as ApolloLink3,
  InMemoryCache as InMemoryCache3,
} from "@apollo/client-3";
import { print } from "graphql";
import type { ApolloClient as AnyApolloClient } from "@/types";
import {
  getFragmentWatchCount,
  getFragmentWatchData,
  getFragmentWatches,
} from "../fragmentWatches";

const FRAGMENT = gql`
  fragment ColorFields on Color {
    id
    name
  }
`;

const QUERY = gql`
  query Colors {
    colors {
      id
    }
  }
`;

describe.each([
  [
    "v4",
    () =>
      new ApolloClient({
        cache: new InMemoryCache(),
        link: ApolloLink.empty(),
      }) as AnyApolloClient,
    // v4 shares one cache watch per fragment + entity
    { count: 2 },
  ],
  [
    "v3",
    () =>
      new ApolloClient3({
        cache: new InMemoryCache3(),
        link: ApolloLink3.empty(),
      }) as AnyApolloClient,
    { count: 4 },
  ],
])("getFragmentWatches (%s)", (_, createClient, expected) => {
  test("groups fragment watches by fragment and entity", () => {
    const client = createClient() as ApolloClient;

    const subscriptions = ["1", "1", "1", "2"].map((id) =>
      client
        .watchFragment({
          fragment: FRAGMENT,
          from: { __typename: "Color", id },
        })
        .subscribe(() => {})
    );
    // Query watches are not included
    subscriptions.push(
      client
        .watchQuery({ query: QUERY, fetchPolicy: "cache-only" })
        .subscribe(() => {})
    );

    expect(getFragmentWatchCount(client)).toBe(expected.count);

    const [fragmentWatch, ...rest] = getFragmentWatches(client);

    expect(rest).toHaveLength(0);
    expect(fragmentWatch).toMatchObject({
      name: "ColorFields",
      count: expected.count,
    });
    expect(fragmentWatch.entities).toEqual([
      { id: "Color:1", variables: null },
      { id: "Color:2", variables: null },
    ]);
    // Only the fragment definition is included, not the wrapping query
    expect(
      fragmentWatch.document.definitions.map((definition) => definition.kind)
    ).toEqual(["FragmentDefinition"]);
    expect(print(fragmentWatch.document)).toMatch(
      /^fragment ColorFields on Color/
    );

    subscriptions.forEach((subscription) => subscription.unsubscribe());
  });

  test("reads cached data for a watched entity", () => {
    const client = createClient() as ApolloClient;

    client.writeFragment({
      fragment: FRAGMENT,
      data: { __typename: "Color", id: "1", name: "red" },
    });

    const subscription = client
      .watchFragment({
        fragment: FRAGMENT,
        from: { __typename: "Color", id: "1" },
      })
      .subscribe(() => {});

    expect(
      getFragmentWatchData(client, {
        fragmentName: "ColorFields",
        id: "Color:1",
        variables: null,
      })
    ).toEqual({
      data: expect.objectContaining({ id: "1", name: "red" }),
      complete: true,
    });

    expect(
      getFragmentWatchData(client, {
        fragmentName: "ColorFields",
        id: "Color:2",
        variables: null,
      })
    ).toBeNull();

    subscription.unsubscribe();
  });
});
