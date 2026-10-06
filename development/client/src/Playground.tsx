import { gql } from "@apollo/client";
import { useApolloClient, useFragment, useQuery } from "./ClientContext";
import React, { useEffect, useRef, useState } from "react";
import {
  SHARED_HOOK_ITEM_COUNT,
  SHARED_HOOK_ITEM_FRAGMENT,
  SHARED_HOOK_QUERY,
  sharedHookColorHex,
} from "./sharedHookColors";

const FRAGMENT = gql`
  fragment SingleColorFragment on Color {
    name
    hex
  }
`;

const NESTED_FRAGMENT = gql`
  fragment SingleColorNestedFragment on Color {
    hex
    ...HexName
  }

  fragment HexName on Color {
    name
  }
`;

// A hook shared by many components to demonstrate duplicate watches
function useSharedColors() {
  return useQuery(SHARED_HOOK_QUERY, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
}

function SharedHookConsumer() {
  const { loading } = useSharedColors();

  return (
    <span
      title={loading ? "loading" : "done"}
      style={{
        display: "inline-block",
        width: 12,
        height: 12,
        margin: 1,
        background: loading ? "orange" : "seagreen",
      }}
    />
  );
}

function ItemFragmentWatches({ count }: { count: number }) {
  const client = useApolloClient();

  useEffect(() => {
    const subscriptions = Array.from({ length: count }, (_, i) =>
      client
        .watchFragment({
          fragment: SHARED_HOOK_ITEM_FRAGMENT,
          from: { __typename: "Color", hex: sharedHookColorHex(i) },
        })
        .subscribe(() => {})
    );

    return () => subscriptions.forEach((s) => s.unsubscribe());
  }, [client, count]);

  return null;
}

// Frames longer than this mean the main thread is busy enough to drop frames
const BLOCKED_FRAME_MS = 50;
// How long to keep showing a block after it ends
const BLOCKED_HOLD_MS = 5000;

// Shows when the main thread is blocked. The spinner is rotated from
// requestAnimationFrame so it freezes while JavaScript is busy.
function MainThreadMonitor() {
  const spinnerRef = useRef<HTMLDivElement>(null);
  const [lastBlock, setLastBlock] = useState<number | null>(null);

  useEffect(() => {
    let frame: number;
    let clearBlock: ReturnType<typeof setTimeout> | undefined;
    let last = performance.now();
    let angle = 0;

    const tick = (now: number) => {
      const gap = now - last;
      last = now;
      angle = (angle + 6) % 360;

      if (spinnerRef.current) {
        spinnerRef.current.style.transform = `rotate(${angle}deg)`;
      }

      if (gap > BLOCKED_FRAME_MS) {
        setLastBlock(gap);
        clearTimeout(clearBlock);
        clearBlock = setTimeout(() => setLastBlock(null), BLOCKED_HOLD_MS);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(clearBlock);
    };
  }, []);

  const blocked = lastBlock !== null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: blocked ? "crimson" : "seagreen",
        fontWeight: "bold",
      }}
    >
      <div
        ref={spinnerRef}
        style={{
          width: 16,
          height: 16,
          border: "3px solid currentColor",
          borderTopColor: "transparent",
          borderRadius: "50%",
        }}
      />
      {blocked
        ? `Main thread was blocked for ${(lastBlock / 1000).toFixed(1)}s`
        : "Main thread OK"}
    </div>
  );
}

function WatchedColor({ hex }: { hex: string }) {
  useFragment({ fragment: FRAGMENT, from: { __typename: "Color", hex } });

  return <div>Watching Color:{hex}</div>;
}

export function Playground() {
  const client = useApolloClient();
  const [watchFragments, setWatchFragments] = useState(false);
  // Applied values. The inputs are only applied on submit so that typing a
  // number doesn't mount every intermediate count.
  const [sharedHookCount, setSharedHookCount] = useState(0);
  const [fragmentWatchCount, setFragmentWatchCount] = useState(0);
  const [hookInput, setHookInput] = useState("100");
  const [fragmentWatchInput, setFragmentWatchInput] = useState(
    String(SHARED_HOOK_ITEM_COUNT)
  );

  return (
    <div>
      <div>
        <button
          onClick={() => {
            client.writeFragment({
              fragment: FRAGMENT,
              data: { __typename: "Color", name: "Test Red", hex: "FF0000" },
            });
          }}
        >
          Write fragment
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            client.writeFragment({
              fragment: NESTED_FRAGMENT,
              fragmentName: "SingleColorNestedFragment",
              data: { __typename: "Color", name: "Test Red", hex: "FF0000" },
            });
          }}
        >
          Write nested fragment
        </button>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={watchFragments}
            onChange={(e) => setWatchFragments(e.target.checked)}
          />
          Watch fragments
        </label>
        {watchFragments && (
          <>
            <WatchedColor hex="FF0000" />
            <WatchedColor hex="FF0000" />
            <WatchedColor hex="FF0000" />
            <WatchedColor hex="00FF00" />
          </>
        )}
      </div>
      <div>
        <h3>Shared useQuery hook</h3>
        <MainThreadMonitor />
        <p>
          Every hook writes the same {SHARED_HOOK_ITEM_COUNT}-item response to
          the cache.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFragmentWatchCount(Math.max(0, Number(fragmentWatchInput) || 0));
            setSharedHookCount(Math.max(0, Number(hookInput) || 0));
          }}
        >
          <label>
            Fragment watches{" "}
            <input
              type="number"
              min={0}
              value={fragmentWatchInput}
              onChange={(e) => setFragmentWatchInput(e.target.value)}
            />
          </label>{" "}
          <label>
            Mounted hooks{" "}
            <input
              type="number"
              min={0}
              value={hookInput}
              onChange={(e) => setHookInput(e.target.value)}
            />
          </label>{" "}
          <button type="submit">Apply</button>
          <button
            type="button"
            onClick={() => {
              setFragmentWatchCount(0);
              setSharedHookCount(0);
            }}
          >
            Unmount all
          </button>
        </form>
        <p>
          Tip: the cache memoizes broadcasts for up to 5000 watches by default (
          <code>inMemoryCache.maybeBroadcastWatch</code>). Total watches are
          fragment watches + mounted hooks, so with 100 hooks compare 4800 vs
          5000 fragment watches and watch the Diff counts.
        </p>
        <ItemFragmentWatches count={fragmentWatchCount} />
        <div>
          Applied: {fragmentWatchCount} fragment watches, {sharedHookCount}{" "}
          hooks (<span style={{ color: "orange" }}>■</span> loading,{" "}
          <span style={{ color: "seagreen" }}>■</span> done)
        </div>
        <button
          onClick={() =>
            client.refetchQueries({ include: [SHARED_HOOK_QUERY] })
          }
        >
          Refetch
        </button>
        <div>
          {Array.from({ length: sharedHookCount }, (_, i) => (
            <SharedHookConsumer key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
