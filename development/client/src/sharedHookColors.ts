import { gql } from "@apollo/client";

// Large, identical-every-time response used by the Playground to reproduce
// expensive cache writes and broadcasts. Answered by a local link in each
// client provider so it doesn't depend on the dev server.
export const SHARED_HOOK_OPERATION_NAME = "SharedHookColors";
export const SHARED_HOOK_ITEM_COUNT = 100;

export const SHARED_HOOK_QUERY = gql`
  query SharedHookColors {
    sharedHookColors {
      hex
      name
      contrast
      rgb
    }
  }
`;

export const SHARED_HOOK_ITEM_FRAGMENT = gql`
  fragment SharedHookColorItem on Color {
    hex
    name
  }
`;

const NETWORK_DELAY_MS = 20;

export function sharedHookColorHex(index: number) {
  return index.toString(16).padStart(6, "0");
}

export const sharedHookColors = Array.from(
  { length: SHARED_HOOK_ITEM_COUNT },
  (_, i) => ({
    __typename: "Color",
    hex: sharedHookColorHex(i),
    name: `Color ${i}`,
    contrast: "#ffffff",
    rgb: `rgb(${i % 256}, ${Math.floor(i / 256) % 256}, 0)`,
  })
);

export function respondWithSharedHookColors(observer: {
  next: (value: any) => void;
  complete: () => void;
}) {
  const timeout = setTimeout(() => {
    observer.next({ data: { sharedHookColors } });
    observer.complete();
  }, NETWORK_DELAY_MS);

  return () => clearTimeout(timeout);
}
