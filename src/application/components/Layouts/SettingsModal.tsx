import { Button } from "../Button";
import { ExternalLink } from "../ExternalLink";
import { Modal } from "../Modal";

declare const VERSION: string;

export function SettingsModal({
  open = false,
  onOpen,
}: {
  open?: boolean;
  onOpen: (open: boolean) => void;
}) {
  return (
    <Modal open={open} onClose={onOpen} size="sm">
      <Modal.Header>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Devtools version:{" "}
        <ExternalLink
          className="font-code"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://github.com/apollographql/apollo-client-devtools/releases/tag/v${VERSION}`}
        >
          {VERSION}
        </ExternalLink>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" size="md" onClick={() => onOpen(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
