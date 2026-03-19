import { isNetworkRequestSettled } from "../isNetworkRequestSettled";

describe("isNetworkRequestSettled", () => {
  test("returns true for networkStatus 7 (ready)", () => {
    expect(isNetworkRequestSettled(7)).toBe(true);
  });

  test("returns true for networkStatus 8 (error)", () => {
    expect(isNetworkRequestSettled(8)).toBe(true);
  });

  test("returns false for in-flight statuses (1-4, 6)", () => {
    expect(isNetworkRequestSettled(1)).toBe(false);
    expect(isNetworkRequestSettled(2)).toBe(false);
    expect(isNetworkRequestSettled(3)).toBe(false);
    expect(isNetworkRequestSettled(4)).toBe(false);
    expect(isNetworkRequestSettled(6)).toBe(false);
  });
});
