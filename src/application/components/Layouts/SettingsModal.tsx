import { Button } from "../Button";
import { ExternalLink } from "../ExternalLink";
import { Modal } from "../Modal";
import { TextField } from "../TextField";

declare const VERSION: string;

export function SettingsModal({
  open = false,
  onOpen,
}: {
  open?: boolean;
  onOpen: (open: boolean) => void;
}) {
  return (
    <Modal open={open} onClose={onOpen} size="md">
      <Modal.Header>
        <Modal.Title>Settings</Modal.Title>
        <Modal.Description>
          Devtools version:{" "}
          <ExternalLink
            className="font-code"
            href={`https://github.com/apollographql/apollo-client-devtools/releases/tag/apollo-client-devtools@${VERSION}`}
          >
            {VERSION}
          </ExternalLink>
        </Modal.Description>
      </Modal.Header>
      <Modal.Body>
        <TextField
          label="Cache write limit"
          size="sm"
          placeholder="Enter a max limit"
          type="number"
          defaultValue={500}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" size="md" onClick={() => onOpen(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
