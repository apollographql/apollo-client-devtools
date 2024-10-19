import { ConnectorsRequestList } from "../../../components/ConnectorsRequestList";
import { useRequest } from "../$id";

export function Route() {
  const request = useRequest();

  return <ConnectorsRequestList requests={request.debuggingResult.data} />;
}
