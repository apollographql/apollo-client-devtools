import { makeVar } from "@apollo/client";

export enum Screens {
  Cache = "cache",
  Queries = "queries",
  Mutations = "mutations",
  Connectors = "connectors",
  Explorer = "explorer",
}

export const currentScreen = makeVar<Screens>(Screens.Queries);
