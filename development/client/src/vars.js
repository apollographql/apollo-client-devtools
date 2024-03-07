import { makeVar } from "@apollo/client/cache/devtools";

export const counterVar = makeVar(0, { displayName: "counter" });
