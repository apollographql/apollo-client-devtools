import { expectTypeOf } from "expect-type";
import { Modal } from "../Modal";
import { Disclosure } from "../Disclosure";
import { useDevToolsSelector } from "../../machines/devtoolsMachine";
import { VSCodeCommand } from "../VSCode/VSCodeCommand";
import { VSCodeSetting } from "../VSCode/VSCodeSetting";

expectTypeOf<typeof import("./PortNotOpenModal.jsx")>().toMatchTypeOf<
  typeof import("./PortNotOpenModal.vscode.jsx")
>();

interface ErrorModalProps {
  open: boolean;
}

const StartDevTools = (
  <VSCodeCommand
    command="apollographql/startDevToolsServer"
    title="Apollo: Start Apollo Client DevTools Server"
  />
);
const StopDevTools = '"Apollo: Stop Apollo Client DevTools Server"';
const ServerPortSettings = (
  <VSCodeSetting name="apollographql.devTools.serverPort" />
);

export function PortNotOpenModal({ open }: ErrorModalProps) {
  const port = useDevToolsSelector(
    (state) => state.context.port ?? "<default port>"
  );
  return (
    <Modal open={open} size="xl">
      <Modal.Header>
        <Modal.Title>DevTools Server not running on port {port}</Modal.Title>
        <Modal.Description>
          The Apollo Client DevTools Server is currently not running. This can
          have one of the following reasons:
        </Modal.Description>
      </Modal.Header>
      <Modal.Body>
        <div className="mt-4 flex flex-col gap-2">
          <Disclosure>
            <Disclosure.Button>
              Another instance of the DevTools is already running on port {port}
            </Disclosure.Button>
            <Disclosure.Panel>
              <p>
                If you are using the DevTools in another Workspace, they might
                already have started the DevTools Server.
              </p>
              <p>You can resolve this with one of these steps:</p>
              <ul className="list-disc list-outside ml-4">
                <li>
                  By stopping the server in that other instance (e.g. by running
                  the {StopDevTools} command or by closing the Workspace)
                </li>
                <li>
                  By changing the port of the DevTools Server (
                  {ServerPortSettings}) in your workspace settings and
                  restarting the server with the {StartDevTools} command.
                </li>
              </ul>
            </Disclosure.Panel>
          </Disclosure>
          <Disclosure>
            <Disclosure.Button>
              Another program is already running on port {port}
            </Disclosure.Button>
            <Disclosure.Panel>
              <p>
                If you are using the DevTools in another Workspace, they might
                already have started the DevTools Server.
              </p>
              <p>You can resolve this with one of these steps:</p>
              <ul className="list-disc list-outside ml-4">
                <li>
                  By stopping the process currently running on that port.
                  <br />
                  You can find out which process is currently running on that
                  port by running one of the following commands in your
                  terminal:
                  <ul className="list-disc list-outside ml-4">
                    <li>
                      In macOS:
                      <br />
                      <code>sudo lsof -i :{port}</code>
                    </li>
                    <li>
                      In Windows (Powershell):
                      <br />
                      <code>
                        Get-NetTCPConnection -LocalPort {port} | Format-List
                      </code>
                    </li>
                    <li>
                      In Windows (Cmd):
                      <br />
                      <code>netstat -ano -p tcp | find &quot;{port}&quot;</code>
                    </li>
                    <li>
                      In Linux:
                      <br />
                      <code>sudo ss -tulpn | grep :{port}</code>
                    </li>
                  </ul>
                  After that, kill that process and restart the DevTools Server
                  with the {StartDevTools} command.
                </li>
                <li>
                  By changing the port of the DevTools Server (
                  <code>apollographql.devTools.serverPort</code>) in your
                  workspace settings and restarting the server with the{" "}
                  {StartDevTools} command.
                </li>
              </ul>
            </Disclosure.Panel>
          </Disclosure>
          <Disclosure>
            <Disclosure.Button>
              The DevTools were stopped manually
            </Disclosure.Button>
            <Disclosure.Panel>
              <p>
                You might have stopped the DevTools Server with the{" "}
                {StopDevTools} command.
                <br />
                You can start it again with the {StartDevTools} command.
              </p>
            </Disclosure.Panel>
          </Disclosure>
        </div>
      </Modal.Body>
    </Modal>
  );
}
