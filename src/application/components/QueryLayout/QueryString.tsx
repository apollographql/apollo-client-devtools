import { CodeBlock } from "../CodeBlock";

interface QueryStringProps {
  code: string;
}

export function QueryString({ code }: QueryStringProps) {
  return (
    <div
      data-testid="query"
      className="flex-1 min-h-28 max-h-[500px] lg:max-h-none overflow-auto"
    >
      <CodeBlock language="graphql" code={code} className="max-h-full" />
    </div>
  );
}
