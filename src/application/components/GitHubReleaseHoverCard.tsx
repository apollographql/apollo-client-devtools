import type { ReactNode } from "react";
import { HoverCard } from "./HoverCard";
import { Badge } from "./Badge";
import { Markdown } from "./Markdown";
import { Spinner } from "./Spinner";
import IconOutlink from "@apollo/icons/small/IconOutlink.svg";
import IconGitHub from "@apollo/icons/default/IconGitHubSolid.svg";
import IconBranch from "@apollo/icons/default/IconBranch.svg";
import type { SnapshotVersion } from "../utilities/github";
import {
  isSnapshotRelease,
  parseSnapshotRelease,
  parseSnapshotTimestamp,
} from "../utilities/github";
import { useGitHubApi } from "../hooks/useGitHubAPI";
import { StatusBadge } from "./StatusBadge";
import { ExternalLink } from "./ExternalLink";

interface GitHubReleaseHoverCardProps {
  children?: ReactNode;
  version: string;
}

export function GitHubReleaseHoverCard({
  children,
  version,
}: GitHubReleaseHoverCardProps) {
  return (
    <HoverCard openDelay={0}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Content>
        {isSnapshotRelease(version) ? (
          <SnapshotCardContents version={version} />
        ) : (
          <ReleaseCardContents version={version} />
        )}
      </HoverCard.Content>
    </HoverCard>
  );
}

function SnapshotCardContents({ version }: { version: SnapshotVersion }) {
  const release = parseSnapshotRelease(version);
  const { status, data: pullRequest } = useGitHubApi<GitHubPullRequest>(
    `/repos/apollographql/apollo-client/pulls/${release.prNumber}`,
    { cache: true }
  );

  if (status === "pending") {
    return <LoadingState />;
  }

  if (status === "error") {
    return (
      <ErrorMessage message="Error: Could not load pull request from GitHub" />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1 bg-primary dark:bg-primary-dark">
        <h1 className="text-md text-heading dark:text-heading-dark font-heading font-medium flex items-center gap-2">
          <IconGitHub className="size-4" />
          <span className="whitespace-nowrap">{version}</span>
          <Badge variant="info">Snapshot</Badge>
        </h1>
        {release && (
          <>
            <div className="flex gap-1 items-center text-xs font-bold uppercase text-secondary dark:text-secondary-dark">
              Published {formatDate(parseSnapshotTimestamp(release.timestamp))}
            </div>
            <ExternalLink
              className="flex gap-1 items-center mt-2"
              href={`https://github.com/apollographql/apollo-client/pull/${release.prNumber}`}
              target="_blank"
              rel="noreferrer"
            >
              View pull request in GitHub <IconOutlink className="size-3" />
            </ExternalLink>
          </>
        )}
      </header>

      <section>
        <div className="mb-2">
          <ExternalLink
            href={pullRequest.user.html_url}
            target="_blank"
            rel="noreferrer"
          >
            @{pullRequest.user.login}
          </ExternalLink>{" "}
          opened{" "}
          <ExternalLink
            href={pullRequest.html_url}
            target="_blank"
            rel="noreferrer"
          >
            #{pullRequest.number}
          </ExternalLink>{" "}
          on {formatDate(Date.parse(pullRequest.created_at))}:
        </div>
        <h2 className="text-lg text-heading dark:text-heading-dark font-medium mb-2">
          <Markdown>{pullRequest.title}</Markdown>
        </h2>
        <div className="flex mt-2">
          {pullRequest.merged ? (
            <StatusBadge
              className="text-sm"
              variant="hidden"
              color="purple"
              icon={<IconBranch />}
            >
              Merged {formatDate(Date.parse(pullRequest.merged_at))} into{" "}
              <ExternalLink
                href={`https://github.com/apollographql/apollo-client/commit/${pullRequest.merge_commit_sha}`}
                target="_blank"
                rel="noreferrer"
              >
                {pullRequest.merge_commit_sha.slice(0, 7)}
              </ExternalLink>
            </StatusBadge>
          ) : pullRequest.state === "closed" ? (
            <StatusBadge
              className="text-sm"
              variant="hidden"
              color="red"
              icon={<IconBranch />}
            >
              Closed {formatDate(Date.parse(pullRequest.closed_at))}
            </StatusBadge>
          ) : (
            <StatusBadge
              className="text-sm"
              variant="hidden"
              color="green"
              icon={<IconBranch />}
            >
              Open
            </StatusBadge>
          )}
        </div>
        <Markdown className="[&:not(:empty)]:mt-6">{pullRequest.body}</Markdown>
      </section>
    </div>
  );
}

function ReleaseCardContents({ version }: { version: string }) {
  const currentRelease = useGitHubApi<GitHubRelease>(
    `/repos/apollographql/apollo-client/releases/tags/v${version}`,
    { cache: true }
  );

  const latestRelease = useGitHubApi<GitHubRelease>(
    "/repos/apollographql/apollo-client/releases/latest",
    { cache: true }
  );

  if (
    currentRelease.status === "pending" ||
    latestRelease.status === "pending"
  ) {
    return <LoadingState />;
  }

  if (currentRelease.status === "error" || latestRelease.status === "error") {
    return <ErrorMessage message="Error: Could not load release from GitHub" />;
  }

  const release = currentRelease.data;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1 bg-primary dark:bg-primary-dark">
        <h2 className="text-2xl text-heading dark:text-heading-dark font-heading font-medium flex items-center gap-2">
          <IconGitHub className="size-6" />
          {release.name}{" "}
          {release.prerelease ? (
            <Badge variant="beta">Pre-release</Badge>
          ) : latestRelease.data.name === release.name ? (
            <Badge variant="success">Latest</Badge>
          ) : (
            <Badge variant="warning">Outdated</Badge>
          )}
        </h2>
        <div className="flex gap-1 items-center text-xs font-bold uppercase text-secondary dark:text-secondary-dark">
          Published {formatDate(Date.parse(release.published_at))}
        </div>
        <a
          className="flex gap-1 items-center mt-2"
          href={`https://github.com/apollographql/apollo-client/releases/tag/v${version}`}
          target="_blank"
          rel="noreferrer"
        >
          View release in GitHub <IconOutlink className="size-3" />
        </a>
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

interface GitHubPullRequest {
  id: number;
  number: number;
  state: "open" | "closed";
  locked: boolean;
  title: string;
  body: string;
  created_at: string;
  closed_at: string;
  merged_at: string;
  merge_commit_sha: string;
  html_url: string;
  merged: boolean;
  user: {
    name: string;
    login: string;
    avatar_url: string;
    url: string;
    html_url: string;
  };
}

function formatDate(date: Date | number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex min-w-80 min-h-80 items-center justify-center text-md font-semibold">
      {message}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-w-80 min-h-80">
      <Spinner size="lg" />
    </div>
  );
}
