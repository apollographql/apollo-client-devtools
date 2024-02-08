import { Button } from "./Button";
import { ButtonGroup } from "./ButtonGroup";
import { Disclosure } from "./Disclosure";
import { GitHubIssueLink, SECTIONS } from "./GitHubIssueLink";
import { Modal } from "./Modal";

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
      </Modal.Header>
      <Modal.Body>
        <p>
          An Apollo Client instance was not found, either because an Apollo
          Client instance was never created, or because it could not be
          discovered. This is most commonly fixed by setting the{" "}
          <ConnectToDevToolsOptionLink /> to <code>true</code>.
        </p>
        <p className="mt-4">
          If this was reached in error, please try one of the following
          suggestions or click the &quot;Retry&quot; button to try looking for
          the client again.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Disclosure>
            <Disclosure.Button>
              I&apos;m running my application in development mode
            </Disclosure.Button>
            <Disclosure.Panel>
              <p>
                Apollo Client only connects to Apollo Client Devtools in
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
              in development mode. If you would like to use Apollo Client
              Devtools for your production application, set the{" "}
              <ConnectToDevToolsOptionLink /> to <code>true</code> in your
              Apollo Client instance.
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
                this discussion.
              </a>{" "}
              for updates on this feature.
            </Disclosure.Panel>
          </Disclosure>

          <Disclosure>
            <Disclosure.Button>
              I have set <code>connectToDevTools</code> to <code>true</code>
            </Disclosure.Button>
            <Disclosure.Panel>
              <p>
                Apollo Client Devtools relies on the presence of a global{" "}
                <code>window</code> variable set from the client. Check for{" "}
                <code>window.__APOLLO_CLIENT__</code> in your browser console to
                see if this variable is set.
              </p>
              <p className="mt-4">
                If this variable is not set, this is most likely a bug with
                Apollo Client. Please open a{" "}
                <GitHubIssueLink
                  labels={["🐞 bug"]}
                  repository="apollo-client"
                  body={`
<!-- Please provide a detailed description of the issue you are experiencing. It is most helpful if you are able to provide a minimal reproduction of the issue. -->

### Link to Reproduction
<!-- Please provide a link to the reproduction of the issue. -->

${SECTIONS.apolloClientVersion}
${SECTIONS.devtoolsVersion}
`}
                >
                  GitHub issue
                </GitHubIssueLink>{" "}
                with the Apollo Client repository to get help from the Apollo
                Client maintainers.
              </p>
            </Disclosure.Panel>
          </Disclosure>

          <Disclosure>
            <Disclosure.Button>
              <code>window.__APOLLO_CLIENT__</code> contains a reference to my
              client instance
            </Disclosure.Button>
            <Disclosure.Panel>
              <p>
                Occasionally the Apollo Client instance was set correctly on
                window, but the Apollo Client Devtools could not find it in
                time. Apollo Client Devtools checks for the{" "}
                <code>window.__APOLLO_CLIENT__</code> variable for up to 10
                seconds before giving up.
              </p>
              <p className="mt-4">
                Check your browser console for the{" "}
                <code>window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__.ApolloClient</code>{" "}
                variable to see if it contains a reference to your client
                instance. If the Apollo Client instance is not set, this likely
                indicates your client was not discovered in time. Click the
                &quot;Retry&quot; button below to try connecting to your Apollo
                Client instance again.
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
              This is likely a bug with Apollo Client Devtools. Please create a{" "}
              <GitHubIssueLink
                labels={["🐞 bug", ":mag: apollo-client-discovery"]}
                body={`
${SECTIONS.default}
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
