import { expectTypeOf } from "expect-type";
import { Button } from "../Button";
import { GitHubIssueLink, SECTIONS, LABELS } from "../GitHubIssueLink";
import { Modal } from "../Modal";
import IconGitHubSolid from "@apollo/icons/small/IconGitHubSolid.svg";
import { Disclosure } from "../Disclosure";
import { useDevToolsSelector } from "../../machines/devtoolsMachine";

expectTypeOf<typeof import("./PortNotOpenModal.jsx")>().toMatchTypeOf<
  typeof import("./PortNotOpenModal.vscode.jsx")
>();

interface ErrorModalProps {
  open: boolean;
}

export function PortNotOpenModal({ open }: ErrorModalProps) {
  const port = useDevToolsSelector(
    (state) => state.context.port ?? "<default port>"
  );
  return (
    <Modal open={open} size="xl">
      <Modal.Header>
        <Modal.Title>DevTools Server not running on port {port}</Modal.Title>
      </Modal.Header>{" "}
      <Modal.Description>
        The Apollo Client DevTools Server is currently not running. This can
        have one of the following reasons:
      </Modal.Description>
      <Modal.Body>
        <div className="mt-4 flex flex-col gap-2">
          <Disclosure>
            <Disclosure.Button>
              Another instance of the DevTools is already running on port {port}
            </Disclosure.Button>
            <Disclosure.Panel>TODO</Disclosure.Panel>
          </Disclosure>
          <Disclosure>
            <Disclosure.Button>
              Another program is already running on port {port}
            </Disclosure.Button>
            <Disclosure.Panel>TODO</Disclosure.Panel>
          </Disclosure>
          <Disclosure>
            <Disclosure.Button>
              The DevTools were stopped manually
            </Disclosure.Button>
            <Disclosure.Panel>TODO</Disclosure.Panel>
          </Disclosure>
        </div>
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
