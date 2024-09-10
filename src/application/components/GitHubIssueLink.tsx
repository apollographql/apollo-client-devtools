import type { ReactNode } from "react";
import { forwardRef } from "react";
import { ExternalLink } from "./ExternalLink";

declare const VERSION: string;

interface GitHubIssueLinkProps {
  className?: string;
  body?: string;
  labels?: string[];
  repository?: "apollo-client" | "apollo-client-devtools" | "vscode-graphql";
  children?: ReactNode;
}

const WHITESPACE = /\s/g;
const DEFAULT_DESCRIPTION =
  "<!-- Please provide a detailed description of the issue you are experiencing. It is most helpful if you are able to provide a minimal reproduction of the issue. -->\n";

export const SECTIONS = {
  defaultDescription: DEFAULT_DESCRIPTION,
  apolloClientVersion: `### \`@apollo/client\` version
<!-- Please provide the version of \`@apollo/client\` you are using. -->
`,
  devtoolsVersion: `### Apollo Client Devtools version
${VERSION} (${__IS_FIREFOX__ ? "Firefox" : __IS_VSCODE__ ? "VSCode" : "Chrome"})
`,
  reproduction: `### Link to Reproduction
<!-- Please provide a link to the reproduction of the issue. -->
`,
} as const;

export const LABELS = {
  bug: "🐞 bug",
  clientDiscovery: ":mag: apollo-client-discovery",
};

export const GitHubIssueLink = forwardRef<
  HTMLAnchorElement,
  GitHubIssueLinkProps
>(function GitHubIssueLink(
  {
    body = DEFAULT_DESCRIPTION,
    className,
    repository = "apollo-client-devtools",
    labels,
    children,
    ...props
  },
  ref
) {
  let params = "body=" + encodeURIComponent(body.trim());

  if (labels) {
    // GitHub does not like it when issues have their labels uri encoded so we
    // avoid doing that here.
    params +=
      "&labels=" +
      labels.map((label) => label.replace(WHITESPACE, "+")).join(",");
  }

  return (
    <ExternalLink
      {...props}
      ref={ref}
      className={className}
      rel="noreferrer noopener"
      target="_blank"
      href={`https://github.com/apollographql/${repository}/issues/new?${params}`}
    >
      {children}
    </ExternalLink>
  );
});
