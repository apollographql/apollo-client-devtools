import { makeVar } from "@apollo/client";

export const counterVar = makeVar(0, { displayName: "counter" });

setTimeout(() => {
  const dummy = makeVar(
    { count: 0, root: true, nested: { value: true, name: "test" } },
    { displayName: "dummy" }
  );

  setInterval(() => {
    const value = dummy();
    dummy({
      count: value.count + 1,
      root: !value.root,
      nested: { value: !value.nested.value, name: "test" },
    });
  }, 2000);
}, 5000);

const clock = makeVar(new Date(), { displayName: "clock" });

setInterval(() => {
  clock(new Date());
}, 1000);
