import { Button } from "../Button";
import { GitHubIssueLink, SECTIONS, LABELS } from "../GitHubIssueLink";
import { Modal } from "../Modal";
import IconGitHubSolid from "@apollo/icons/small/IconGitHubSolid.svg";

interface ErrorModalProps {
  open: boolean;
}

export function UnknownErrorModal({ open }: ErrorModalProps) {
  return (
    <Modal open={open} onClose={() => false} size="xl">
      <Modal.Header>
        <Modal.Title>Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Modal.Description>
          An unknown error occured. <br />
          If this error persists, please open an issue on GitHub.
        </Modal.Description>
      </Modal.Body>
      <Modal.Footer>
        <Button
          asChild
          size="md"
          variant="secondary"
          icon={<IconGitHubSolid />}
        >
          <GitHubIssueLink
            className="no-underline"
            labels={[LABELS.bug]}
            body={`
${SECTIONS.defaultDescription}
${SECTIONS.apolloClientVersion}
${SECTIONS.devtoolsVersion}
`}
          >
            <span>Create an issue</span>
          </GitHubIssueLink>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
