import type { ApolloClient } from "@apollo/client";

export function trackCacheActivity(): ApolloClient.Experiment {
  return Object.assign(
    function trackCacheActivity() {
      // this;
    },
    { v: 1 as const }
  );
}
