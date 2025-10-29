import { diff, ADDED, DELETED, CHANGED } from "../diff";

test("returns undefined when objects are deeply equal", () => {
  const result = diff({ a: 1 }, { a: 1 });

  expect(result).toBeUndefined();
});

test("diffs objects with new keys", () => {
  const result = diff({ a: 1 }, { a: 1, b: 1 });

  expect(result).toEqual({ b: ADDED });
});

test("diffs objects with removed keys", () => {
  const result = diff({ a: 1, b: 1 }, { a: 1 });

  expect(result).toEqual({ b: [DELETED, 1] });
});

test("diffs changes to existing keys", () => {
  const result = diff({ a: 1 }, { a: 2 });

  expect(result).toEqual({ a: [CHANGED, 1, 2] });
});

test("returns undefined when arrays are deeply equal", () => {
  const result = diff([0], [0]);

  expect(result).toBeUndefined();
});

test("diffs arrays with new items", () => {
  const result = diff([0], [0, 1]);

  expect(result).toEqual([undefined, ADDED]);
});

test("diffs arrays with removed items", () => {
  const result = diff([0, 1], [0]);

  expect(result).toEqual([undefined, [DELETED, 1]]);
});

test("diffs arrays with changed items", () => {
  const result = diff([0], [1]);

  expect(result).toEqual([[CHANGED, 0, 1]]);
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
      c: [[CHANGED, 0, 1], [CHANGED, 1, 2], ADDED],
      d: {
        e: {
          f: [CHANGED, true, false],
          g: ADDED,
        },
      },
    },
    foo: [DELETED, true],
    bar: [undefined, [DELETED, 1]],
    baz: [undefined, { b: [CHANGED, 2, 3], c: ADDED }, [DELETED, { c: 2 }]],
  });
});
