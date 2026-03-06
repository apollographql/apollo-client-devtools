/* eslint-disable @typescript-eslint/consistent-type-imports */

import type React from "react";
import { useState } from "react";
import { clsx } from "clsx";
import { LoadingSpinner } from "./LoadingSpinner";
import { hasGraphRefBeenAuthenticated } from "./postMessageAuthHelpers";
import {
  DEV_TOOLS_AUTHENTICATE_WITH_GRAPHREF,
  OutgoingMessageEvent,
} from "./postMessageHelpers";
import { Telescope } from "./Telescope";
import { Modal } from "../Modal";
import { ButtonGroup } from "../ButtonGroup";
import { Button } from "../Button";
import { TextField } from "../TextField";

export const GraphRefModal = ({
  onClose,
  graphRef,
  setGraphRef,
  setNewGraphRefLoading,
  newGraphRefLoading,
  postMessage,
  wasTriggeredByIntrospectionFailure,
}: {
  onClose: () => void;
  graphRef: string | undefined;
  setGraphRef: (graphRef: string) => void;
  setNewGraphRefLoading: (newValue: boolean) => void;
  newGraphRefLoading: boolean;
  postMessage: (message: OutgoingMessageEvent) => void;
  wasTriggeredByIntrospectionFailure: boolean;
}): React.ReactElement => {
  const [graphId, setGraphId] = useState<string>();
  const [graphVariant, setGraphVariant] = useState<string>();

  return (
    <Modal open onClose={onClose} size="lg" className="min-h-[422px]">
      <Modal.Header
        className={clsx("flex-col", { hidden: newGraphRefLoading })}
      >
        <Telescope className="w-[125px] h-[100px] m-auto" />
        <Modal.Title>
          {wasTriggeredByIntrospectionFailure
            ? "We could not introspect your schema."
            : "Choose another graph to populate the Explorer."}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex flex-col">
        {newGraphRefLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <p>
              {wasTriggeredByIntrospectionFailure
                ? "Would you like to use a schema registered in Apollo Studio to populate Explorer? "
                : ""}
              To continue, log in and authorize to use your Studio account.{" "}
              <strong className="font-semibold">
                You must enable popups on your browser to use this feature.
              </strong>
            </p>

            <div className="flex gap-2 justify-between mt-6 [@media(max-width:500px)]:flex-col">
              <TextField
                autoFocus
                label="Graph id"
                size="sm"
                placeholder="acephei"
                value={graphId}
                onChange={(e) => setGraphId(e.target.value)}
              />
              <TextField
                label="Graph variant"
                size="sm"
                name="value"
                placeholder="current"
                value={graphVariant}
                onChange={(e) => setGraphVariant(e.target.value)}
              />
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className={clsx({ hidden: newGraphRefLoading })}>
        <ButtonGroup>
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={!graphId || !graphVariant}
            onClick={() => {
              const newGraphRef = `${graphId}@${graphVariant}`;
              if (graphId && graphVariant && newGraphRef !== graphRef) {
                setNewGraphRefLoading(true);
                // if the graphRef has already been auth'd,
                // we can just pass it as a param, otherwise we must auth!
                if (hasGraphRefBeenAuthenticated(newGraphRef)) {
                  setGraphRef(newGraphRef);
                } else {
                  postMessage({
                    name: DEV_TOOLS_AUTHENTICATE_WITH_GRAPHREF,
                    graphRef: newGraphRef,
                  });
                }
              }
            }}
          >
            Authorize
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </Modal>
  );
};
