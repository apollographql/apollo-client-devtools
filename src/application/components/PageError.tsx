import { twMerge } from "tailwind-merge";

import ErrorPlanet from "../assets/error-planet.svg";
import { GitHubIssueLink, LABELS, SECTIONS } from "./GitHubIssueLink";
import type { ReactNode } from "react";

interface PageErrorProps {
  className?: string;
  children: ReactNode;
}

export function PageError({ children, className }: PageErrorProps) {
  return (
    <div className={twMerge("flex flex-col gap-6 items-center", className)}>
      <ErrorPlanet className="w-36" />
      {children}
    </div>
  );
}

interface PageErrorContentProps {
  children?: ReactNode;
}

export function PageErrorContent({ children }: PageErrorContentProps) {
  return <div className="text-center">{children}</div>;
}

interface PageErrorTitleProps {
  children?: ReactNode;
}

export function PageErrorTitle({ children }: PageErrorTitleProps) {
  return <h1 className="font-heading text-xl font-medium">{children}</h1>;
}

interface PageErrorBodyProps {
  children: ReactNode;
}

export function PageErrorBody({ children }: PageErrorBodyProps) {
  return <p className="mt-3 first:mt-0">{children}</p>;
}

interface PageErrorLinkProps {
  error: Error;
  children: ReactNode;
  remarks?: string;
}

export function PageErrorLink({
  remarks,
  error,
  children,
}: PageErrorLinkProps) {
  return (
    <GitHubIssueLink
      labels={[LABELS.bug]}
      body={`
${remarks}

\`\`\`
${error.message}

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
