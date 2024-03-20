import { useEffect, useState } from "react";
import { Select } from "./Select";
import { getRpcClient } from "../../extension/devtools/panelRpcClient";
import type { ApolloClientInfo } from "../../types";
import { getPanelActor } from "../../extension/devtools/panelActor";

interface ClientSelectProps {
  onChange: (clientId: string) => void;
}

const rpcClient = getRpcClient(window);
const panelActor = getPanelActor(window);

export function ClientSelect({ onChange }: ClientSelectProps) {
  const [clients, setClients] = useState<ApolloClientInfo[]>([]);

  useEffect(() => {
    rpcClient.request("getClients").then(setClients);

    return panelActor.on("registerClient", (message) => {
      setClients((clients) => [...clients, message.payload]);
    });
  }, []);

  if (clients.length === 0) {
    return null;
  }

  return (
    <Select
      align="end"
      size="sm"
      defaultValue={clients[0].id}
      onValueChange={onChange}
    >
      {clients.map((client) => (
        <Select.Option key={client.id} value={client.id}>
          {client.name}
        </Select.Option>
      ))}
    </Select>
  );
}
