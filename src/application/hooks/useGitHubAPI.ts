import type { Reducer } from "react";
import { useEffect, useReducer } from "react";

interface GitHubError {
  documentation_url: string;
  message: string;
}

interface Options {
  cache?: boolean;
}

type State<T> =
  | { status: "pending"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: Error };

type Action<T> =
  | { type: "load" }
  | { type: "success"; payload: T }
  | { type: "failed"; error: Error };

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case "load":
      return { status: "pending", data: null, error: null };
    case "success":
      return { status: "success", data: action.payload, error: null };
    case "failed":
      return { status: "error", data: null, error: action.error };
    default:
      return state;
  }
}

export function useGitHubApi<T>(url: string, options?: Options): State<T> {
  const [state, dispatch] = useReducer<Reducer<State<T>, Action<T>>>(reducer, {
    status: "pending",
    data: null,
    error: null,
  });

  useEffect(() => {
    let ignored = false;
    dispatch({ type: "load" });

    fetchGitHub<T>(url, { cache: options?.cache }).then(
      (data) => !ignored && dispatch({ type: "success", payload: data }),
      (error) => !ignored && dispatch({ type: "failed", error })
    );

    return () => {
      ignored = true;
    };
  }, [url, options?.cache]);

  return state;
}

const cache = new Map<string, unknown>();

async function fetchGitHub<T>(url: string, options?: Options) {
  if (options?.cache && cache.has(url)) {
    return cache.get(url) as T;
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const body = await response.json();

  if (response.ok) {
    if (options?.cache) {
      cache.set(url, body);
    }

    return body as T;
  }

  throw new Error((body as GitHubError).message);
}
