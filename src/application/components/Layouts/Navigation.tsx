import { makeVar } from "@apollo/client";

export enum Screens {
  Cache = "cache",
  Queries = "queries",
  Mutations = "mutations",
  Explorer = "explorer",
}

export const currentScreen = makeVar<Screens>(Screens.Queries);
