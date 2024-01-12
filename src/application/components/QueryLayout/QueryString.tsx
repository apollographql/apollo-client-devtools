import { CodeBlock } from "../CodeBlock";

interface QueryStringProps {
  code: string;
}

export function QueryString({ code }: QueryStringProps) {
  return (
    <div
      data-testid="query"
      className="[grid-area:content] max-h-[500px] lg:max-h-none"
    >
      <CodeBlock language="graphql" code={code} className="max-h-full" />
    </div>
  );
}
