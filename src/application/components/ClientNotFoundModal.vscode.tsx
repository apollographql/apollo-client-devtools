import IconWarningSolid from "@apollo/icons/default/IconWarningSolid.svg";
import { CodeBlock } from "./CodeBlock";
import { Disclosure } from "./Disclosure";
import { GitHubIssueLink, SECTIONS, LABELS } from "./GitHubIssueLink";
import { Modal } from "./Modal";
import { expectTypeOf } from "expect-type";

expectTypeOf<typeof import("./ClientNotFoundModal.jsx")>().toMatchTypeOf<
  typeof import("./ClientNotFoundModal.vscode.jsx")
>();

interface ClientNotFoundModalProps {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export function ClientNotFoundModal({
  open,
  onClose,
}: ClientNotFoundModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="xl">
      <Modal.Header>
        <Modal.Title>Waiting for connection from Apollo Client.</Modal.Title>
        <Modal.Description>
          An Apollo Client instance has not connected to the VSCode DevTools
          extension yet, either because it was never created or because it was
          not registered.
        </Modal.Description>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <p>
          To connect your client with the VSCode extension, use the following
          instructions.
        </p>
        <Disclosure defaultOpen>
          <Disclosure.Button>Setup your client</Disclosure.Button>
          <Disclosure.Panel>
            <ol className="list-inside list-decimal flex flex-col gap-4">
              <li>
                Install the <code>@apollo/client-devtools-vscode package</code>
                <CodeBlock
                  language="bash" // disabling the copy button because it makes a one-line code snippet too big
                  copyable={false}
                  code={`
npm install @apollo/client-devtools-vscode
            `.trim()}
                />
              </li>
              <li>
                After initializing your <code>ApolloClient</code> instance, call
                <code>registerClient</code> with your client instance.
                <CodeBlock
                  language="javascript"
                  // disabling the copy button because it overlaps the import path too much - might consider enabling it after visual improvements
                  copyable={false}
                  code={`
import { registerClient } from "@apollo/client-devtools-vscode";

const client = new ApolloClient({ /* ... */ });

// we recommend wrapping this statement in a check for e.g. process.env.NODE_ENV === "development"
const devtoolsRegistration = registerClient(
  client,
  // the default port of the VSCode DevTools is 7095
  "ws://localhost:7095",
);
            `.trim()}
                />
              </li>
            </ol>
          </Disclosure.Panel>
        </Disclosure>
        <p className="mt-4">
          If you&apos;ve already finished this setup and you&apos;re still not
          getting a connection, please try one of the following suggestions.
        </p>
        <div className="flex flex-col gap-2">
          <Disclosure>
            <Disclosure.Button>
              Ensure your application can reach the DevTools server port
            </Disclosure.Button>
            <Disclosure.Panel>
              The VSCode DevTools extension starts a WebSocket server on port{" "}
              <code>7095</code>. Make sure your application can reach this port,
              e.g. by checking that you are in the same network and the port is
              opened in your firewall.
            </Disclosure.Panel>
          </Disclosure>

          <Disclosure>
            <Disclosure.Button>
              Expose VSCode DevTools to another machine using port forwarding
            </Disclosure.Button>
            <Disclosure.Panel className="flex flex-col gap-4">
              <p>
                VSCode provides built-in support for port forwarding that allows
                you to forward the port from your local machine to a publically
                accessible url. Learn how to setup port forwarding in the{" "}
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://code.visualstudio.com/docs/editor/port-forwarding#_how-to-use-local-port-forwarding"
                >
                  VSCode docs
                </a>
                .
              </p>
              <p className="border-l-4 border-l-gray-400 dark:border-l-primary-dark pl-4">
                This upgrades your connection to the wss protocol.
              </p>
              <h4 className="flex items-center gap-1 text-md font-semibold font-heading text-heading dark:text-heading-dark">
                <IconWarningSolid className="size-4 text-icon-warning dark:text-icon-warning-dark" />{" "}
                Warning
              </h4>
              <p>
                By default, the forwarded port is <b>private</b> and requires
                you to authenticate with GitHub. Unfortunately VSCode does not
                offer a way to acquire an authentication token so you will need
                to change the port visibility to &quot;Public&quot;. Doing so
                allows anyone with the URL to connect their Apollo Client
                instance with your VSCode DevTools.
              </p>
              <p>
                <b>If you are fine with the public visibility</b>, copy the
                forwarded address, change the protocol from <code>ws</code> to{" "}
                <code>wss</code> and adjust your <code>registerClient</code>{" "}
                call accordingly:
                <CodeBlock
                  language="javascript"
                  code={`
const devtoolsRegistration = registerClient(
  client,
  "wss://your-tunnel-url.devtunnels.ms/",
);
            `.trim()}
                />
              </p>
              <p>
                If you want use a private connection, you will need to use the{" "}
                <code>devtunnel</code> CLI instead. See the next section for
                more information.
              </p>
            </Disclosure.Panel>
          </Disclosure>

          <Disclosure>
            <Disclosure.Button>
              Expose the VSCode Devtools to another machine using
              Microsoft&apos;s <code>devtunnel</code> CLI
            </Disclosure.Button>
            <Disclosure.Panel>
              <p>
                If you want to use a DevTunnel secured with a token, you need to
                install the <code>devtunnel</code> CLI, as described here:
                <br />
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/get-started?tabs=macos#install"
                >
                  Installation instructions
                </a>
                <br />
                After that, authenticate with your GitHub account:
              </p>
              <CodeBlock
                language="bash"
                copyable={false}
                code={`
devtunnel login
            `.trim()}
              />
              <p>and create a DevTunnel with a port and a token:</p>
              <CodeBlock
                language="bash"
                copyable={false}
                code={`
devtunnel create
devtunnel port create --port-number 7095 --protocol http
devtunnel token --scope connect
            `.trim()}
              />
              <p>This will create a token to connect to your tunnel.</p>
              <CodeBlock
                language="bash"
                copyable={false}
                code={`
Token tunnel ID: your-tunnel-id
Token scope: connect
Token lifetime: 1.00:00:00
Token expiration: 2024-09-06 12:55:06 UTC
Token: your-very-long-token
`.trim()}
              />
              <p>
                Note the token here - you will need it in a moment. <br />
                You can now start your tunnel:
              </p>
              <p>
                <em>
                  Note the the tunnel url will be different for every call to{" "}
                  <code>devtunnel host</code>!
                </em>
              </p>
              <CodeBlock
                language="bash"
                copyable={false}
                code={`
devtunnel host
`.trim()}
              />
              <CodeBlock
                language="bash"
                copyable={false}
                code={`
Hosting port: 7095
Connect via browser: https://your-tunnel-url.devtunnels.ms
Inspect network activity: https://your-tunnel-url.devtunnels.ms

Ready to accept connections for tunnel: your-tunnel-id
`.trim()}
              />
              <p>
                Now you can add the tunnel url and the token to your
                <code>registerClient</code> call:
              </p>
              <CodeBlock
                language="javascript"
                code={`
const devtoolsRegistration = registerClient(client, [
  "wss://your-tunnel-url.devtunnels.ms",
  {
    headers: {
      "X-Tunnel-Authorization":
        "tunnel your-very-long-token",
    },
  },
]);
            `.trim()}
              />
              <p>
                This requires that you use a WebSocket client that accepts a
                non-standard option object with headers as the second argument.
                <br />
                If your WebSocket implementation does not support this, you can
                use the <code>ws</code> package to polyfill this behavior:
              </p>
              <CodeBlock
                language="javascript"
                code={`
import { WebSocket } from "ws";
globalThis.WebSocket = WebSocket;
            `.trim()}
              />
            </Disclosure.Panel>
          </Disclosure>

          <Disclosure>
            <Disclosure.Button>
              I&apos;ve exhausted all other options
            </Disclosure.Button>
            <Disclosure.Panel>
              This could be a bug with Apollo Client Devtools or the VSCode
              Extension. Please create a{" "}
              <GitHubIssueLink
                repository="vscode-graphql"
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
    </Modal>
  );
}
