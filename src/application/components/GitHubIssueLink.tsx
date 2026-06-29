import type { ReactNode } from "react";
import { forwardRef } from "react";
import { ExternalLink } from "./ExternalLink";

interface GitHubIssueLinkProps {
  className?: string;
  repository?: "apollo-client" | "apollo-client-devtools" | "vscode-graphql";
  children?: ReactNode;
}

export const GitHubIssueLink = forwardRef<
  HTMLAnchorElement,
  GitHubIssueLinkProps
>(function GitHubIssueLink(
  { className, repository = "apollo-client-devtools", children, ...props },
  ref
) {
  return (
    <ExternalLink
      {...props}
      ref={ref}
      className={className}
      href={`https://github.com/apollographql/${repository}/issues`}
    >
      {children}
    </ExternalLink>
  );
});
