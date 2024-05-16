import type { Options } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { twMerge } from "tailwind-merge";
import { CodeBlock } from "./CodeBlock";

interface MarkdownProps {
  className?: string;
  children?: string;
  componentOverrides?: NonNullable<Options["components"]>;
}

const components: NonNullable<Options["components"]> = {
  h1: ({ children }) => (
    <h2 className="text-lg font-medium text-heading font-heading dark:text-heading-dark">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading text-heading text-lg font-medium dark:text-heading-dark">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading text-heading text-md font-medium dark:text-heading-dark">
      {children}
    </h3>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-4 flex flex-col gap-2">{children}</ul>
  ),
  li: ({ children }) => (
    <li>
      <div className="flex flex-col gap-2">{children}</div>
    </li>
  ),
  a: ({ node, ...props }) => (
    <a
      {...props}
      className="font-semibold underline-offset-4 underline"
      target="_blank"
      rel="noopener"
    />
  ),
  pre: ({ children }) => children as JSX.Element,
  code: ({ children, className }) => {
    const language = className?.replace("language-", "");
    const isInline = language === undefined;

    return isInline ? (
      <code>{children}</code>
    ) : (
      <CodeBlock
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
      className={twMerge("flex flex-col gap-4", className)}
      components={{ ...components, ...componentOverrides }}
    >
      {children}
    </ReactMarkdown>
  );
}
