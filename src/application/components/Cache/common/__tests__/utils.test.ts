import {
  getRootCacheIds,
  convertCacheJsonIntoObject,
  objectFilter,
} from "../utils";

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

  describe("#convertCacheJsonIntoObject", () => {
    it("should return an empty object if the cache JSON is empty", () => {
      expect(convertCacheJsonIntoObject(JSON.stringify({}))).toEqual({});
    });

    it("should convert cache JSON into an object", () => {
      const data = {
        "Result:1": {
          id: 1,
          __typename: "Result",
          name: "Result 1",
        },
      };
      const json = JSON.stringify(data);
      expect(convertCacheJsonIntoObject(json)).toEqual(data);
    });

    it("should convert refs into the referred to object instead", () => {
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
      };

      const json = JSON.stringify(data);
      const convertedData = convertCacheJsonIntoObject(json);

      expect(convertedData["Result:1"]).toEqual(data["Result:1"]);
      expect(convertedData.ROOT_QUERY).toEqual({
        __typename: "Query",
        search: {
          __typename: "Results",
          results: [
            {
              id: 1,
              __typename: "Result",
              name: "Result 1",
            },
            {
              id: 2,
              __typename: "Result",
              name: "Result 2",
            },
          ],
        },
      });
    });

    it("should convert nested refs into nested objects instead", () => {
      const data = {
        "Car:1": {
          id: 1,
          __typename: "Car",
          name: "Car 1",
          warehouses: [
            {
              __ref: "Warehouse:1",
            },
            {
              __ref: "Warehouse:2",
            },
          ],
        },
        "Warehouse:1": {
          id: 1,
          __typename: "Warehouse",
          name: "Warehouse 1",
        },
        "Warehouse:2": {
          id: 2,
          __typename: "Warehouse",
          name: "Warehouse 2",
        },
        ROOT_QUERY: {
          __typename: "Query",
          inventory: {
            __typename: "Inventory",
            cars: [
              {
                __ref: "Car:1",
              },
            ],
          },
        },
      };

      const json = JSON.stringify(data);
      const convertedData = convertCacheJsonIntoObject(json);

      expect(convertedData["Car:1"]).toEqual({
        id: 1,
        __typename: "Car",
        name: "Car 1",
        warehouses: [
          {
            id: 1,
            __typename: "Warehouse",
            name: "Warehouse 1",
          },
          {
            id: 2,
            __typename: "Warehouse",
            name: "Warehouse 2",
          },
        ],
      });
      expect(convertedData["Warehouse:1"]).toEqual(data["Warehouse:1"]);
      expect(convertedData.ROOT_QUERY).toEqual({
        __typename: "Query",
        inventory: {
          __typename: "Inventory",
          cars: [
            {
              id: 1,
              __typename: "Car",
              name: "Car 1",
              warehouses: [
                {
                  id: 1,
                  __typename: "Warehouse",
                  name: "Warehouse 1",
                },
                {
                  id: 2,
                  __typename: "Warehouse",
                  name: "Warehouse 2",
                },
              ],
            },
          ],
        },
      });
    });
  });

  describe("#objectFilter", () => {
    it("should return a new object with key/value pair if matching key found", () => {
      const car = {
        make: "Ford",
        model: "Pinto",
      };
      expect(objectFilter(car, "make")).toEqual({
        make: "Ford",
      });
    });

    it("should return a new object with key/value pair if partial matching key found", () => {
      const car = {
        make: "Ford",
        model: "Pinto",
      };
      expect(objectFilter(car, "ma")).toEqual({
        make: "Ford",
      });
    });

    it("should return a new object with key/value pair if matching string value found", () => {
      const car = {
        make: "Ford",
        model: "Pinto",
      };
      expect(objectFilter(car, "Ford")).toEqual({
        make: "Ford",
      });
    });

    it("should return a new object with key/value pair if partial matching string value found", () => {
      const car = {
        make: "Ford",
        model: "Pinto",
      };
      expect(objectFilter(car, "Fo")).toEqual({
        make: "Ford",
      });
    });

    it("should return all key/value pair matches in a new object", () => {
      const car = {
        makeName: "Ford",
        makeId: "FRD010",
      };
      expect(objectFilter(car, "make")).toEqual({
        makeName: "Ford",
        makeId: "FRD010",
      });
    });

    it("should return key/value matches using case insensitivity", () => {
      const car = {
        make: "FORD",
        model: "Pinto",
      };
      expect(objectFilter(car, "ford")).toEqual({
        make: "FORD",
      });
    });

    it("should return undefined if no matching key/value is found", () => {
      const car = {
        make: "Ford",
        model: "Pinto",
      };
      expect(objectFilter(car, "vin")).toBeUndefined();
    });

    it("should exclude nested objects", () => {
      const car = {
        make: "Ford",
        model: {
          id: "Pinto",
        },
      };
      expect(objectFilter(car, "Pinto")).toBeUndefined();
    });
  });
});
