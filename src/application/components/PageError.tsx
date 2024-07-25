import { twMerge } from "tailwind-merge";

import ErrorPlanet from "../assets/error-planet.svg";
import { GitHubIssueLink, LABELS, SECTIONS } from "./GitHubIssueLink";
import type { ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

interface PageErrorProps {
  className?: string;
  children: ReactNode;
}

export function PageError({ children, className }: PageErrorProps) {
  return (
    <div
      className={twMerge(
        "flex flex-col gap-6 items-center max-w-2xl mx-auto",
        className
      )}
    >
      <ErrorPlanet className="w-36" />
      {children}
    </div>
  );
}

interface PageErrorContentProps {
  children?: ReactNode;
}

function PageErrorContent({ children }: PageErrorContentProps) {
  return <div className="text-center">{children}</div>;
}

interface PageErrorTitleProps {
  children?: ReactNode;
}

function PageErrorTitle({ children }: PageErrorTitleProps) {
  return <h1 className="font-heading text-xl font-medium">{children}</h1>;
}

interface PageErrorBodyProps {
  children: ReactNode;
}

function PageErrorBody({ children }: PageErrorBodyProps) {
  return <p className="mt-3 first:mt-0">{children}</p>;
}

interface PageErrorDetailsProps {
  error: Error;
}

function PageErrorDetails({ error }: PageErrorDetailsProps) {
  return (
    <details className="text-left w-full">
      <summary className="text-center">Error details</summary>
      <CodeBlock
        language="plain"
        code={`${error.name}: ${error.message}\n\n${error.stack}`}
      />
    </details>
  );
}

interface PageErrorLinkProps {
  error: Error;
  children: ReactNode;
  remarks?: string;
}

function PageErrorGitHubLink({ remarks, error, children }: PageErrorLinkProps) {
  return (
    <GitHubIssueLink
      labels={[LABELS.bug]}
      body={`
${remarks}

\`\`\`
${error.name}: ${error.message}

${error.stack}
\`\`\`

### Additional details
<!-- Please provide any additional details of the issue here, otherwise feel free to delete this section. -->

${SECTIONS.apolloClientVersion}
${SECTIONS.devtoolsVersion}
`}
    >
      {children}
    </GitHubIssueLink>
  );
}

PageError.Content = PageErrorContent;
PageError.GitHubLink = PageErrorGitHubLink;
PageError.Details = PageErrorDetails;
PageError.Body = PageErrorBody;
PageError.Title = PageErrorTitle;
PageError.Content = PageErrorContent;
