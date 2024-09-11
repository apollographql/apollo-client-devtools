import type { Options } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { twMerge } from "tailwind-merge";
import { CodeBlock } from "./CodeBlock";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkGithub from "remark-github";
import type { ReactNode } from "react";
import { ExternalLink } from "./ExternalLink";

interface MarkdownProps {
  className?: string;
  children?: string;
  componentOverrides?: NonNullable<Options["components"]>;
}

function Heading({
  level,
  className,
  children,
}: {
  level: 2 | 3 | 4;
  className?: string;
  children?: ReactNode;
}) {
  const Element = `h${level}` as const;

  return (
    <Element
      className={twMerge(
        "font-heading text-heading dark:text-heading-dark font-medium mt-4 first:mt-0 mb-2",
        className
      )}
    >
      {children}
    </Element>
  );
}

const components: NonNullable<Options["components"]> = {
  h1: ({ children }) => (
    <Heading level={2} className="text-lg">
      {children}
    </Heading>
  ),
  h2: ({ children }) => (
    <Heading level={2} className="text-lg">
      {children}
    </Heading>
  ),
  h3: ({ children }) => (
    <Heading level={3} className="text-md">
      {children}
    </Heading>
  ),
  h4: ({ children }) => (
    <Heading level={4} className="text-sm">
      {children}
    </Heading>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-4 flex flex-col gap-2">{children}</ul>
  ),
  p: ({ children }) => <p className="mt-2 first:mt-0">{children}</p>,
  a: ({ node, ...props }) => (
    <ExternalLink
      href="#"
      {...props}
      className="font-semibold underline-offset-4 underline"
      target="_blank"
      rel="noopener"
    />
  ),
  pre: ({ children }) => children as JSX.Element,
  details: ({ children }) => (
    <details className="mt-2 first:mt-0 cursor-pointer">{children}</details>
  ),
  summary: ({ children }) => (
    <summary className="[&>:is(h1,h2,h3,h4,h5,h6)]:inline has-[h1,h2,h3,h4,h5,h6]:mb-2">
      {children}
    </summary>
  ),
  code: ({ children, className }) => {
    const language = className?.replace("language-", "");
    const isInline = language === undefined;

    return isInline ? (
      <code>{children}</code>
    ) : (
      <CodeBlock
        className="mt-2 first:mt-0"
        code={children as string}
        language={language}
        copyable={false}
      />
    );
  },
};

export function Markdown({
  className,
  children,
  componentOverrides,
}: MarkdownProps) {
  return (
    <ReactMarkdown
      className={twMerge("flex flex-col", className)}
      components={{ ...components, ...componentOverrides }}
      remarkPlugins={[
        remarkGfm,
        [remarkGithub, { repository: "apollographql/apollo-client" }],
      ]}
      rehypePlugins={[rehypeRaw]}
    >
      {children}
    </ReactMarkdown>
  );
}
