import { useEffect, useReducer, type ReactNode } from "react";
import { HoverCard } from "./HoverCard";
import { Badge } from "./Badge";
import { Markdown } from "./Markdown";
import { Spinner } from "./Spinner";
import IconOutlink from "@apollo/icons/small/IconOutlink.svg";
import IconGitHub from "@apollo/icons/default/IconGitHubSolid.svg";

interface GitHubReleaseHoverCardProps {
  children?: ReactNode;
  version: string;
}

export function GitHubReleaseHoverCard({
  children,
  version,
}: GitHubReleaseHoverCardProps) {
  if (version.startsWith("0.0.0")) {
    return children;
  }

  return (
    <HoverCard openDelay={0}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Content>
        <CardContents version={version} />
      </HoverCard.Content>
    </HoverCard>
  );
}

type ReleaseState =
  | { status: "pending"; data: null }
  | { status: "success"; data: ReleaseData }
  | { status: "error"; data: null };

type Action =
  | { type: "load" }
  | { type: "success"; payload: ReleaseData }
  | { type: "failed" };

function reducer(state: ReleaseState, action: Action): ReleaseState {
  switch (action.type) {
    case "load":
      return { status: "pending", data: null };
    case "success":
      return { status: "success", data: action.payload };
    case "failed":
      return { status: "error", data: null };
    default:
      return state;
  }
}

function CardContents({ version }: { version: string }) {
  const [{ status, data }, dispatch] = useReducer(reducer, {
    status: "pending",
    data: null,
  });

  useEffect(() => {
    let ignored = false;
    dispatch({ type: "load" });
    getGitHubRelease(version).then(
      (data) => {
        if (ignored) {
          return;
        }

        dispatch({ type: "success", payload: data });
      },
      () => {
        if (!ignored) {
          dispatch({ type: "failed" });
        }
      }
    );

    return () => {
      ignored = true;
    };
  }, [version]);

  if (status === "pending") {
    return (
      <div className="flex items-center justify-center min-w-80 min-h-80">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === "error") {
    return "Error";
  }

  const { release, latest } = data;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 bg-primary dark:bg-primary-dark">
        <h2 className="text-2xl text-heading dark:text-heading-dark font-heading font-medium flex items-center gap-2">
          <IconGitHub className="size-6" />
          {release.name}{" "}
          {release.prerelease ? (
            <Badge variant="beta">Pre-release</Badge>
          ) : latest ? (
            <Badge variant="success">Latest</Badge>
          ) : (
            <Badge variant="warning">Outdated</Badge>
          )}
        </h2>
        <div className="flex gap-4">
          <a
            className="flex gap-1 items-center"
            href={`https://github.com/apollographql/apollo-client/releases/tag/v${version}`}
            target="_blank"
            rel="noreferrer"
          >
            View release in GitHub <IconOutlink className="size-3" />
          </a>
        </div>
      </header>
      <Markdown>{release.body}</Markdown>
    </div>
  );
}

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  target_commitish: string;
}

interface ReleaseData {
  latest: boolean;
  release: GitHubRelease;
}

const cache = new Map<string, ReleaseData>();

async function getGitHubRelease(version: string): Promise<ReleaseData> {
  if (cache.has(version)) {
    return cache.get(version)!;
  }

  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const [release, latestRelease] = await Promise.all([
    fetch(
      `https://api.github.com/repos/apollographql/apollo-client/releases/tags/v${version}`,
      { headers }
    ).then((res) => res.json() as Promise<GitHubRelease>),
    fetch(
      `https://api.github.com/repos/apollographql/apollo-client/releases/latest`,
      { headers }
    ).then((res) => res.json() as Promise<GitHubRelease>),
  ]);

  const data = {
    latest: release.name === latestRelease.name,
    release,
  };

  cache.set(version, data);

  return data;
}
