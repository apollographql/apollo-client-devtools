import { useSelector } from "@xstate/react";
import {
  useDevToolsActorRef,
  useDevToolsSelector,
} from "../../machines/devtoolsMachine";
import { ClientNotFoundModal } from "./ClientNotFoundModal";
import { PortNotOpenModal } from "./PortNotOpenModal";
import { UnknownErrorModal } from "./UnknownErrorModal";

export function Modals() {
  const { send } = useDevToolsActorRef();

  let modalHandled = false;
  const modals: React.ReactNode[] = [];

  const openPortNotOpenModal = useDevToolsSelector(
    (state) => state.context.listening === false
  );
  modals.push(
    <PortNotOpenModal
      key="portNotOpen"
      open={!modalHandled && openPortNotOpenModal}
    />
  );
  modalHandled ||= openPortNotOpenModal;

  const reconnectActor = useDevToolsSelector(
    (state) => state.children.reconnect
  );
  const openClientNotFoundModal = useSelector(
    reconnectActor,
    (state) => state?.status === "active" && state.value === "notFound"
  );
  modals.push(
    <ClientNotFoundModal
      key="clientNotFound"
      open={!modalHandled && openClientNotFoundModal}
      onRetry={() => send({ type: "reconnect.retry" })}
    />
  );
  modalHandled ||= openClientNotFoundModal;

  const isErrorState = useDevToolsSelector(
    (state) => state.value.initialization === "error"
  );
  modals.push(
    <UnknownErrorModal
      key="unknownError"
      open={!modalHandled && isErrorState}
    />
  );

  return <>{modals}</>;
}
