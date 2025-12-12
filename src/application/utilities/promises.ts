export interface FulfilledPromise<T> extends Promise<T> {
  status: "fulfilled";
  value: T;
}

export interface PendingPromise<T> extends Promise<T> {
  status: "pending";
}

export interface RejectedPromise<T> extends Promise<T> {
  status: "rejected";
  reason: unknown;
}

export type DecoratedPromise<T> =
  | FulfilledPromise<T>
  | PendingPromise<T>
  | RejectedPromise<T>;

export function decoratePromise<T>(promise: Promise<T>): DecoratedPromise<T> {
  if ("status" in promise) {
    return promise as DecoratedPromise<T>;
  }

  const pendingPromise = promise as PendingPromise<T>;
  pendingPromise.status = "pending";

  pendingPromise.then(
    (value) => {
      if (pendingPromise.status === "pending") {
        const fulfilledPromise =
          pendingPromise as unknown as FulfilledPromise<T>;

        fulfilledPromise.status = "fulfilled";
        fulfilledPromise.value = value;
      }
    },
    (reason) => {
      if (pendingPromise.status === "pending") {
        const rejectedPromise = pendingPromise as unknown as RejectedPromise<T>;

        rejectedPromise.status = "rejected";
        rejectedPromise.reason = reason;
      }
    }
  );

  return promise as DecoratedPromise<T>;
}

export function createResolvedPromise<T>(value: T): FulfilledPromise<T> {
  const promise = Promise.resolve(value) as FulfilledPromise<T>;

  promise.status = "fulfilled";
  promise.value = value;

  return promise;
}
