import { makeVar } from "@apollo/client";
import { useReactiveVar } from "@apollo/client/react";

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

// Lets one tab open another with an item selected, e.g. clicking an operation
// in the Performance tab opens it in the Queries tab.
export interface NavigationTarget {
  screen: Screens;
  name: string;
}

export const navigationTarget = makeVar<NavigationTarget | null>(null);

export function navigateTo(screen: Screens, name: string) {
  navigationTarget({ screen, name });
  currentScreen(screen);
}

export function useNavigationTarget(screen: Screens) {
  const target = useReactiveVar(navigationTarget);

  return target?.screen === screen ? target.name : null;
}

export function clearNavigationTarget() {
  navigationTarget(null);
}
