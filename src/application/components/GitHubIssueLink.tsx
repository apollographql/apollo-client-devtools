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
const DISCLAIMER =
  "<!--\nPLEASE READ BEFORE OPENING THIS ISSUE.\n\nWe ask that you provide a detailed description of the issue you are experiencing. It is most helpful if you are able to provide a minimal reproduction of the issue.\n\nIF NO DETAILS ARE PROVIDED AND YOU OPEN THIS ISSUE AS-IS, WE MAY DECIDE TO CLOSE THIS ISSUE AS NON-REPRODUCIBLE.\n-->\n\n";

export const SECTIONS = {
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
    body = "",
    className,
    repository = "apollo-client-devtools",
    labels,
    children,
    ...props
  },
  ref
) {
  let params = "body=" + encodeURIComponent(DISCLAIMER + body.trim());

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
      href={`https://github.com/apollographql/${repository}/issues/new?${params}`}
    >
      {children}
    </ExternalLink>
  );
});
