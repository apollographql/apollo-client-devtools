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
          No Apollo Client instance has connected to the VSCode DevTools yet.
          Please follow these instructions to connect your client.
        </Modal.Description>
        <ol className="py-2 list-inside list-decimal flex flex-col gap-1">
          <li>
            Install the @apollo/client-devtools-vscode package
            <CodeBlock
              language="bash"
              code={`
npm install @apollo/client-devtools-vscode
            `.trim()}
            />
          </li>
          <li>
            After initializing your `ApolloClient` instance, call
            `registerClient` with your client instance.
            <CodeBlock
              language="javascript"
              // disabling the copy button because it overlaps the import path too much - might consider enabling it after visual improvements
              copyable={false}
              code={`
import { registerClient } from "@apollo/client-devtools-vscode";

// ...

const client = new ApolloClient({ /* ... */});

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
        <Modal.Description>
          If you&apos;ve already finished this setup and you&apos;re still not
          getting a connection, please try one of the following suggestions.
        </Modal.Description>
      </Modal.Header>
      <Modal.Body>
        <div className="mt-4 flex flex-col gap-2">
          <Disclosure>
            <Disclosure.Button>
              Ensure your application can reach the DevTools server port
            </Disclosure.Button>
            <Disclosure.Panel>
              The VSCode DevTools extension starts a WebSocket server on port
              7095. Make sure your application can reach this port, e.g. by
              checking that you are in the same network and the port is opened
              in your firewall.
            </Disclosure.Panel>
          </Disclosure>

          <Disclosure>
            <Disclosure.Button>
              Expose the VSCode Devtools to another machine using VSCode Port
              Forwarding
            </Disclosure.Button>
            <Disclosure.Panel>
              <p>
                This VSCode feature allows you to forward the port from your
                local machine to a publically accessible url. <br />
                See{" "}
                <a href="https://code.visualstudio.com/docs/editor/port-forwarding">
                  How to use local port forwarding
                </a>
                for more information.
                <br />
                By default, this will upgrade your connection to the wss
                protocol and require an additional authentication token.
              </p>
              <p>
                Unfortunately, as of right now, VSCode does not offer any way to
                actually acquire such an authentication token, so if you want to
                stick with this approach, you will have to set the visibility to
                &quot;Public&quot;. <br />
                This would theoretically allow anyone with the URL to connect
                their Apollo Client instance with your VSCode DevTools. If you
                want to keep the connection private, you will have to use the
                <code>devtunnel</code> CLI instead, see the next section. <br />
                <b>If you are fine with the public visibility</b>, copy the
                forwarded address, change the protocol from <code>https</code>{" "}
                to <code>wss</code> and adjust your <code>registerClient</code>{" "}
                call accordingly:
              </p>
              <CodeBlock
                language="javascript"
                code={`
const devtoolsRegistration = registerClient(
  client,
  "wss://your-tunnel-url.devtunnels.ms/",
);
            `.trim()}
              />
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
                <a href="https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/get-started?tabs=macos#install">
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
`}
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
`}
              />
              <CodeBlock
                language="bash"
                copyable={false}
                code={`
Hosting port: 7095
Connect via browser: https://your-tunnel-url.devtunnels.ms
Inspect network activity: https://your-tunnel-url.devtunnels.ms

Ready to accept connections for tunnel: your-tunnel-id
`}
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
                use the `ws` package to polyfill this behavior:
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
