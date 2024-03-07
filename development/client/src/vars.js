import { makeVar } from "@apollo/client";

export const counterVar = makeVar(0, { displayName: "counter" });
