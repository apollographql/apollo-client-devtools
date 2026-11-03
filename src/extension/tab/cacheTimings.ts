import type { DocumentNode } from "graphql";
import type { ApolloClient } from "@/types";
import { patch } from "@/application/utilities/patch";
import type {
  CacheTimings,
  OperationTimings,
  TimingStat,
} from "./shared/types";
import { identifyDocument } from "./identifyDocument";
import { createId } from "@/utils/createId";

// Limit the number of operations sent to the devtools on each update so that
// apps with many documents don't send huge messages.
const MAX_OPERATIONS = 200;

interface Frame {
  childMs: number;
}

type DocumentMethod = (options: { query?: DocumentNode }) => unknown;

// Methods are feature-detected at runtime before patching
interface PatchableCache {
  write: DocumentMethod;
  diff: DocumentMethod;
  broadcastWatches: (...args: unknown[]) => unknown;
  // Private field, broadcasts are skipped while in a transaction
  txCount?: number;
}

// Incremented while running devtools code (e.g. reading query details for the
// Queries tab) so those cache calls aren't attributed to the app.
let untimedDepth = 0;

export function untimed<T>(fn: () => T): T {
  untimedDepth++;

  try {
    return fn();
  } finally {
    untimedDepth--;
  }
}

function createStat(): TimingStat {
  return { count: 0, selfMs: 0, totalMs: 0 };
}

function selfMs(operation: OperationTimings) {
  return operation.write.selfMs + operation.diff.selfMs;
}

/**
 * Records how long the cache spends in `write`, `diff` and `broadcastWatches`,
 * aggregated per document. These methods call each other (`write` broadcasts
 * watches, broadcasting watches diffs each watch), so we keep a stack of timed
 * calls and track the time spent in each method excluding nested timed calls
 * ("self" time) so totals don't double count.
 */
export function createCacheTimings(client: ApolloClient) {
  // Both v3 and v4 have the same signatures for the methods we patch
  const cache = client.cache as unknown as PatchableCache;
  const stack: Frame[] = [];
  const operations = new Map<string, OperationTimings>();
  const broadcastWatches = createStat();
  const reverts: Array<() => void> = [];
  const id = createId();

  function getOperation(document: DocumentNode | undefined) {
    if (!document) {
      return;
    }

    const { kind, name } = identifyDocument(document);
    const key = `${kind} ${name}`;
    let operation = operations.get(key);

    if (!operation) {
      operation = {
        key,
        kind,
        name,
        write: createStat(),
        diff: createStat(),
      };
      operations.set(key, operation);
    }

    return operation;
  }

  function time<T>(stat: TimingStat | undefined, fn: () => T): T {
    if (!stat) {
      return fn();
    }

    const frame: Frame = { childMs: 0 };
    const start = performance.now();
    stack.push(frame);

    try {
      return fn();
    } finally {
      const totalMs = performance.now() - start;
      stack.pop();

      const parent = stack[stack.length - 1];

      if (parent) {
        parent.childMs += totalMs;
      }

      stat.count++;
      stat.totalMs += totalMs;
      stat.selfMs += totalMs - frame.childMs;
    }
  }

  if (typeof cache.write === "function") {
    reverts.push(
      patch(cache, "write", function (original, ...args) {
        if (untimedDepth > 0) {
          return original.apply(this, args);
        }

        return time(getOperation(args[0]?.query)?.write, () =>
          original.apply(this, args)
        );
      })
    );
  }

  if (typeof cache.diff === "function") {
    reverts.push(
      patch(cache, "diff", function (original, ...args) {
        if (untimedDepth > 0) {
          return original.apply(this, args);
        }

        return time(getOperation(args[0]?.query)?.diff, () =>
          original.apply(this, args)
        );
      })
    );
  }

  if (typeof cache.broadcastWatches === "function") {
    reverts.push(
      patch(cache, "broadcastWatches", function (original, ...args) {
        // `broadcastWatches` is a no-op while in a transaction. Skip those
        // calls so the count reflects broadcasts that do work.
        if (cache.txCount || untimedDepth > 0) {
          return original.apply(this, args);
        }

        return time(broadcastWatches, () => original.apply(this, args));
      })
    );
  }

  return {
    snapshot(): CacheTimings {
      return {
        id,
        broadcastWatches: { ...broadcastWatches },
        operations: [...operations.values()]
          .sort((a, b) => selfMs(b) - selfMs(a))
          .slice(0, MAX_OPERATIONS)
          // Copy since the stream sends messages asynchronously
          .map((operation) => ({
            ...operation,
            write: { ...operation.write },
            diff: { ...operation.diff },
          })),
      };
    },
    dispose() {
      // Revert in reverse order in case patches were layered
      reverts.reverse().forEach((revert) => revert());
    },
  };
}
