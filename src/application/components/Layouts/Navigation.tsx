import { makeVar } from "@apollo/client";

export enum Screens {
  Cache = "cache",
  Queries = "queries",
  Mutations = "mutations",
  Explorer = "explorer",
  ReactiveVars = "reactiveVars",
}

export const currentScreen = makeVar<Screens>(Screens.Queries);
