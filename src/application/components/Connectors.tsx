import type { ConnectorsDebuggingPayload } from "../../types";

interface ConnectorsProps {
  payloads: ConnectorsDebuggingPayload[];
}

export function Connectors({ payloads }: ConnectorsProps) {
  console.log(payloads);
  return (
    <main className="overflow-auto flex flex-col p-4">
      <h1 className="font-medium text-heading dark:text-heading-dark text-xl">
        Connectors
      </h1>
      <div>
        {payloads.map((payload, idx) => {
          return <div key={idx}>{JSON.stringify(payload.data, null, 2)}</div>;
        })}
      </div>
    </main>
  );
}
