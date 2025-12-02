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

export function useGitHubApi<T>(path: string, options?: Options): State<T> {
  const [state, dispatch] = useReducer(reducer, {
    status: "pending",
    data: null,
    error: null,
  } as State<T>);

  useEffect(() => {
    let ignored = false;
    dispatch({ type: "load" });

    fetchGitHub<T>(path, { cache: options?.cache }).then(
      (data) => !ignored && dispatch({ type: "success", payload: data }),
      (error) => !ignored && dispatch({ type: "failed", error: error as Error })
    );

    return () => {
      ignored = true;
    };
  }, [path, options?.cache]);

  return state;
}

const cache = new Map<string, unknown>();

async function fetchGitHub<T>(path: string, options?: Options) {
  if (options?.cache && cache.has(path)) {
    return cache.get(path) as T;
  }

  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const body = await response.json();

  if (response.ok) {
    if (options?.cache) {
      cache.set(path, body);
    }

    return body as T;
  }

  throw new Error((body as GitHubError).message);
}
