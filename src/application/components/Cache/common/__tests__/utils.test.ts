import { getRootCacheIds } from "../utils";

describe("Utility tests", () => {
  describe("#getRootCacheIds", () => {
    it("should return an empty array if no cache data is provided", () => {
      expect(getRootCacheIds(undefined)).toEqual([]);
    });

    it("should return an empty array if an empty cache data object is provided", () => {
      expect(getRootCacheIds({})).toEqual([]);
    });

    it("should return an ascending sorted array of root cache IDs from cache data", () => {
      const data = {
        "Result:2": {
          id: 2,
          __typename: "Result",
          name: "Result 2",
        },
        "Result:1": {
          id: 1,
          __typename: "Result",
          name: "Result 1",
        },
      };
      const cacheIds = getRootCacheIds(data);
      expect(cacheIds.length).toBe(2);
      expect(cacheIds[0]).toEqual("Result:1");
    });

    it("should sort ROOT_X fields to the top of the returned array", () => {
      const data = {
        "Result:1": {
          id: 1,
          __typename: "Result",
          name: "Result 1",
        },
        "Result:2": {
          id: 2,
          __typename: "Result",
          name: "Result 2",
        },
        ROOT_QUERY: {
          __typename: "Query",
          search: {
            __typename: "Results",
            results: [
              {
                __ref: "Result:1",
              },
              {
                __ref: "Result:2",
              },
            ],
          },
        },
        ROOT_MUTATION: {
          __typename: "Mutation",
        },
        ROOT_SUBSCRIPTION: {
          __typename: "Subscription",
        },
      };

      const cacheIds = getRootCacheIds(data);
      expect(cacheIds.length).toBe(5);
      expect(cacheIds[0]).toEqual("ROOT_QUERY");
      expect(cacheIds[1]).toEqual("ROOT_MUTATION");
      expect(cacheIds[2]).toEqual("ROOT_SUBSCRIPTION");
      expect(cacheIds[3]).toEqual("Result:1");
    });
  });
});
