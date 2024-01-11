import { CodeBlock } from "../CodeBlock";

interface QueryStringProps {
  code: string;
}

export function QueryString({ code }: QueryStringProps) {
  return (
    <div className="[grid-area:content] max-h-[500px]">
      <CodeBlock language="graphql" code={code} className="max-h-full" />
    </div>
  );
}
