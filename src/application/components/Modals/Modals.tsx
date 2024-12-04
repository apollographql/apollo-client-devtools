import { useSelector } from "@xstate/react";
import {
  useDevToolsActorRef,
  useDevToolsSelector,
} from "../../machines/devtoolsMachine";
import { ClientNotFoundModal } from "./ClientNotFoundModal";
import { PortNotOpenModal } from "./PortNotOpenModal";
import { UnknownErrorModal } from "./UnknownErrorModal";
import { cloneElement } from "react";

export function Modals() {
  const { send } = useDevToolsActorRef();

  const openPortNotOpenModal = useDevToolsSelector(
    (state) => state.context.listening === false
  );

  const reconnectActor = useDevToolsSelector(
    (state) => state.children.reconnect
  );
  const openClientNotFoundModal = useSelector(
    reconnectActor,
    (state) => state?.status === "active" && state.value === "notFound"
  );

  const isErrorState = useDevToolsSelector(
    (state) => state.value.initialization === "error"
  );
  const modals = [
    <PortNotOpenModal key="portNotOpen" open={openPortNotOpenModal} />,
    <ClientNotFoundModal
      key="clientNotFound"
      open={openClientNotFoundModal}
      onRetry={() => send({ type: "reconnect.retry" })}
    />,
    <UnknownErrorModal key="unknownError" open={isErrorState} />,
  ];

  let atLeastOneModalOpen = false;
  return (
    <>
      {modals.map((modal) => {
        if (modal.props.open) {
          if (atLeastOneModalOpen) {
            // we only want to show one open modal at once, even if more than one would qualify to be open.
            return cloneElement(modal, { open: false });
          }
          atLeastOneModalOpen = true;
        }
        return modal;
      })}
    </>
  );
}
