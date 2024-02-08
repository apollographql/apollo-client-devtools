import { ReactNode } from "react";

declare const VERSION: string;

interface GitHubIssueLinkProps {
  body?: string;
  labels?: string[];
  repository?: "apollo-client" | "apollo-client-devtools";
  children: ReactNode;
}

const WHITESPACE = /\s/g;
const DEFAULT_BODY =
  "<!-- Please provide a detailed description of the issue you are experiencing and the steps to reproduce it.-->\n";

export const SECTIONS = {
  default: DEFAULT_BODY,
  apolloClientVersion: `### \`@apollo/client\` version
<!-- Please provide the version of \`@apollo/client\` you are using. -->
`,
  devtoolsVersion: `### Apollo Client Devtools version
${VERSION}
`,
} as const;

export function GitHubIssueLink({
  body = DEFAULT_BODY,
  repository = "apollo-client-devtools",
  labels,
  children,
}: GitHubIssueLinkProps) {
  let params = "body=" + encodeURIComponent(body.trim());

  if (labels) {
    // GitHub does not like it when issues have their labels uri encoded so we
    // avoid doing that here.
    params +=
      "&labels=" +
      labels.map((label) => label.replace(WHITESPACE, "+")).join(",");
  }

  return (
    <a
      rel="noreferrer noopener"
      target="_blank"
      href={`https://github.com/apollographql/${repository}/issues/new?${params}`}
    >
      {children}
    </a>
  );
}
