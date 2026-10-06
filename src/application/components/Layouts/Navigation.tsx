import { makeVar } from "@apollo/client";

export enum Screens {
  Cache = "cache",
  Queries = "queries",
  Mutations = "mutations",
  Fragments = "fragments",
  Performance = "performance",
  Explorer = "explorer",
  Memory = "memory",
}

export const currentScreen = makeVar<Screens>(Screens.Queries);
