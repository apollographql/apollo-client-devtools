import { diff, Deleted, Changed, Added } from "../diff";

describe("diff", () => {
  test("returns undefined when objects are deeply equal", () => {
    const result = diff({ a: 1 }, { a: 1 });

    expect(result).toBeUndefined();
  });

  test("diffs objects with new keys", () => {
    const result = diff({ a: 1 }, { a: 1, b: 1 });

    expect(result).toEqual({ b: new Deleted(1) });
  });

  test("diffs objects with removed keys", () => {
    const result = diff({ a: 1, b: 1 }, { a: 1 });

    expect(result).toEqual({ b: new Deleted(1) });
  });

  test("diffs changes to existing keys", () => {
    const result = diff({ a: 1 }, { a: 2 });

    expect(result).toEqual({ a: new Changed(1, 2) });
  });

  test("returns changed if object changes type", () => {
    const result = diff({ a: { b: 1 } }, { a: 2 });

    expect(result).toEqual({ a: new Changed({ b: 1 }, 2) });
  });

  test("handles changes to values deep in the object", () => {
    const result = diff(
      { a: { b: { c: { d: { e: { f: true } } } } } },
      { a: { b: { c: { d: { e: { f: false } } } } } }
    );

    expect(result).toEqual({
      a: {
        b: {
          c: {
            d: {
              e: {
                f: new Changed(true, false),
              },
            },
          },
        },
      },
    });
  });

  test("returns undefined when arrays are deeply equal", () => {
    const result = diff([0], [0]);

    expect(result).toBeUndefined();
  });

  test("diffs arrays with new items", () => {
    const result = diff([0], [0, 1]);

    expect(result).toEqual([undefined, new Added(1)]);
  });

  test("diffs arrays with removed items", () => {
    const result = diff([0, 1], [0]);

    expect(result).toEqual([undefined, new Deleted(1)]);
  });

  test("diffs arrays with changed items", () => {
    const result = diff([0], [1]);

    expect(result).toEqual([new Changed(0, 1)]);
  });

  test("handles changes to values deep in an array", () => {
    const result = diff(
      { a: [{ b: { c: { d: { e: { f: true } } } } }] },
      { a: [{ b: { c: { d: { e: { f: false } } } } }] }
    );

    expect(result).toEqual({
      a: [
        {
          b: {
            c: {
              d: {
                e: {
                  f: new Changed(true, false),
                },
              },
            },
          },
        },
      ],
    });
  });

  test("kitchen sink", () => {
    const result = diff(
      {
        a: 1,
        b: { c: [0, 1], d: { e: { f: true } } },
        foo: true,
        bar: [0, 1],
        baz: [{ a: 1 }, { b: 2 }, { c: 2 }],
      },
      {
        a: 1,
        b: { c: [1, 2, 3], d: { e: { f: false, g: true } } },
        bar: [0],
        baz: [{ a: 1 }, { b: 3, c: 2 }],
      }
    );

    expect(result).toEqual({
      b: {
        c: [new Changed(0, 1), new Changed(1, 2), new Added(3)],
        d: {
          e: {
            f: new Changed(true, false),
            g: new Added(true),
          },
        },
      },
      foo: new Deleted(true),
      bar: [undefined, new Deleted(1)],
      baz: [
        undefined,
        { b: new Changed(2, 3), c: new Added(2) },
        new Deleted({ c: 2 }),
      ],
    });
  });
});
