import { Button } from "../Button";
import { ButtonGroup } from "../ButtonGroup";
import { Disclosure } from "../Disclosure";
import { GitHubIssueLink, SECTIONS, LABELS } from "../GitHubIssueLink";
import { Modal } from "../Modal";
import IconGitHubSolid from "@apollo/icons/small/IconGitHubSolid.svg";

interface ClientNotFoundModalProps {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
}

function ConnectToDevToolsOptionLink() {
  return (
    <a
      rel="noreferrer noopener"
      target="_blank"
      href="https://www.apollographql.com/docs/react/api/core/ApolloClient#apolloclientoptions-connecttodevtools"
    >
      <code>connectToDevTools</code> option
    </a>
  );
}

export function ClientNotFoundModal({
  open,
  onClose,
  onRetry,
}: ClientNotFoundModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="xl">
      <Modal.Header>
        <Modal.Title>Could not find client</Modal.Title>
        <Modal.Description>
          An Apollo Client instance was not found, either because an Apollo
          Client instance was never created, or because it could not be
          discovered. You can often solve this issue by setting the{" "}
          <ConnectToDevToolsOptionLink /> in your <code>ApolloClient</code>{" "}
          instance to <code>true</code>.
        </Modal.Description>
        <Modal.Description>
          If you&apos;ve already set the <ConnectToDevToolsOptionLink />, please
          try one of the following suggestions or click the <code>Retry</code>{" "}
          button to look for the client again.
        </Modal.Description>
        <Modal.Description>
          Please{" "}
          <GitHubIssueLink
            labels={[LABELS.bug]}
            body={`
${SECTIONS.defaultDescription}
${SECTIONS.apolloClientVersion}
${SECTIONS.devtoolsVersion}
`}
          >
            create an issue
          </GitHubIssueLink>{" "}
          if you have followed the suggestions and continue to see this message.
          This could be a bug with Apollo Client Devtools.
        </Modal.Description>
      </Modal.Header>
      <Modal.Body>
        <div className="mt-4 flex flex-col gap-2">
          <Disclosure>
            <Disclosure.Button>
              I&apos;m running my application in development mode
            </Disclosure.Button>
            <Disclosure.Panel>
              <p>
                By default, Apollo Client connects to Apollo Client Devtools in
                development mode. It detects the current environment using the{" "}
                <code>globalThis.__DEV__</code> variable.{" "}
              </p>
              <p className="mt-4">
                You may need to tweak your bundler settings to set{" "}
                <code>globalThis.__DEV__</code> correctly. See the{" "}
                <a
                  rel="noreferrer noopener"
                  target="_blank"
                  href="https://www.apollographql.com/docs/react/development-testing/reducing-bundle-size/"
                >
                  &quot;Reducing bundle size&quot;
                </a>{" "}
                article for examples on configuring your bundler.
              </p>
              <p className="mt-4">
                Alternatively, set the <ConnectToDevToolsOptionLink /> to{" "}
                <code>true</code> in your Apollo Client instance.
              </p>
            </Disclosure.Panel>
          </Disclosure>

          <Disclosure>
            <Disclosure.Button>
              I&apos;m running my application in production mode
            </Disclosure.Button>
            <Disclosure.Panel>
              By default, Apollo Client only connects to Apollo Client Devtools
              in development mode. To use Apollo Client Devtools for your
              production application, set the <ConnectToDevToolsOptionLink /> to{" "}
              <code>true</code> in your Apollo Client instance.
            </Disclosure.Panel>
          </Disclosure>

          <Disclosure>
            <Disclosure.Button>
              My Apollo Client instance is created in an iframe
            </Disclosure.Button>
            <Disclosure.Panel>
              Apollo Client Devtools does not currently support clients created
              in iframes. Please follow{" "}
              <a
                rel="noreferrer noopener"
                target="_blank"
                href="https://github.com/apollographql/apollo-client-devtools/discussions/380"
              >
                this discussion
              </a>{" "}
              for updates on this feature.
            </Disclosure.Panel>
          </Disclosure>

          <Disclosure>
            <Disclosure.Button>
              I&apos;m using Apollo&apos;s Next.js RSC integration
            </Disclosure.Button>
            <Disclosure.Panel>
              <p>
                Apollo Client Devtools checks for the presence of the{" "}
                <code>window.__APOLLO_CLIENT__</code> variable for up to 10
                seconds after a page load before giving up. When using
                Apollo&apos;s{" "}
                <a
                  rel="noreferrer noopener"
                  target="_blank"
                  href="https://github.com/apollographql/apollo-client-nextjs"
                >
                  Next.js RSC integration
                </a>
                , it is possible that Apollo Client Devtools will be unable to
                connect to the client when the first loaded page does not render
                any client components and no other client components are loaded
                within the first 10 seconds of the page load.
              </p>
              <p className="mt-4">
                Click the &quot;Retry&quot; button below to try connecting to
                the Apollo Client instance after a client component loads.
              </p>
            </Disclosure.Panel>
          </Disclosure>

          <Disclosure>
            <Disclosure.Button>
              I have set <code>connectToDevTools</code> to <code>true</code>
            </Disclosure.Button>
            <Disclosure.Panel>
              <p>
                Apollo Client Devtools relies on the presence of a global{" "}
                <code>window.__APOLLO_CLIENT__</code> variable set from the
                Apollo Client instance. Check your browser console for{" "}
                <code>window.__APOLLO_CLIENT__</code> to see if this variable is
                set.
              </p>
              <p className="mt-4">
                If the value is <code>undefined</code>, this is most likely a
                bug with Apollo Client. Please open a{" "}
                <GitHubIssueLink
                  labels={[LABELS.bug]}
                  repository="apollo-client"
                  body={`
${SECTIONS.defaultDescription}
${SECTIONS.reproduction}
${SECTIONS.apolloClientVersion}
${SECTIONS.devtoolsVersion}
`}
                >
                  GitHub issue
                </GitHubIssueLink>{" "}
                in the Apollo Client repository to get help from the Apollo
                Client maintainers.
              </p>
            </Disclosure.Panel>
          </Disclosure>

          <Disclosure>
            <Disclosure.Button>
              <code>window.__APOLLO_CLIENT__</code> references my client
              instance
            </Disclosure.Button>
            <Disclosure.Panel>
              <p>
                Occasionally the Apollo Client instance was set correctly on
                <code>window</code>, but the Apollo Client Devtools could not
                find it in time. Apollo Client Devtools checks for the presence
                of the <code>window.__APOLLO_CLIENT__</code> variable for up to
                10 seconds before giving up.
              </p>
              <p className="mt-4">
                Apollo Client Devtools exposes a global{" "}
                <code>window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__</code> variable
                that you can use to check if the client was discovered. Check
                your browser console for the{" "}
                <code>window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__.ApolloClient</code>{" "}
                variable to see if it references your Apollo Client instance. If
                this value is <code>undefined</code>, this likely indicates your
                client was not discovered in time. Click the &quot;Retry&quot;
                button below to try connecting to your Apollo Client instance
                again.
              </p>
              <p className="mt-4">
                For best results, ensure your client is created within the first
                10 seconds of your application loading.
              </p>
            </Disclosure.Panel>
          </Disclosure>

          <Disclosure>
            <Disclosure.Button>
              I&apos;ve exhausted all other options
            </Disclosure.Button>
            <Disclosure.Panel>
              This could be a bug with Apollo Client Devtools. Please create a{" "}
              <GitHubIssueLink
                labels={[LABELS.bug, LABELS.clientDiscovery]}
                body={`
${SECTIONS.defaultDescription}
${SECTIONS.apolloClientVersion}
${SECTIONS.devtoolsVersion}
`}
              >
                GitHub issue
              </GitHubIssueLink>{" "}
              to get help from the Apollo Client maintainers.
            </Disclosure.Panel>
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
        <ButtonGroup>
          <Button type="button" size="md" variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button size="md" variant="primary" onClick={onRetry}>
            Retry
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </Modal>
  );
}
