/* 
  The native EventTarget interface is not useable in content scripts in Firefox. 
  We import and extend from this simplified class to use the EventTarget functionality we need.
*/
import EventTarget from "./extension/EventTarget";
import { CustomEventListener, MessageObj } from "./types";

class Relay extends EventTarget {
  private connections = new Map<
    string,
    (event: CustomEvent<MessageObj>) => ReturnType<CustomEventListener>
  >();

  public addConnection = (name: string, fn: (message: MessageObj) => void) => {
    function wrappedFn(event: CustomEvent<MessageObj>) {
      return fn(event.detail);
    }

    this.addEventListener(name, wrappedFn);
    this.connections.set(name, wrappedFn);

    return () => this.removeConnection(name);
  };

  public removeConnection = (name: string) => {
    const fn = this.connections.get(name);
    if (fn) {
      this.removeEventListener(name, fn);
      this.connections.delete(name);
    }
  };

  public broadcast = <TPayload = any>(message: MessageObj<TPayload>) => {
    let event = new CustomEvent(message.message, { detail: message });

    if (message?.to) {
      let destination = message.to;
      let nextDestination: string | undefined;
      let remaining: string[];

      // If there are intermediate destinations
      // Example: 'background:tab:window'
      if (destination.includes(":")) {
        [destination, ...remaining] = message.to.split(":");
        nextDestination = remaining.join(":");
      }

      if (this.connections.has(destination)) {
        event = new CustomEvent(destination, { detail: message });
        event.detail["to"] = nextDestination;
      }
    }

    this.dispatchEvent(event);
  };

  public listen = <TPayload = any>(
    name: string,
    fn: CustomEventListener<TPayload>
  ) => {
    function wrappedFn(event: CustomEvent<MessageObj<TPayload>>) {
      return fn(event.detail);
    }

    this.addEventListener(name, wrappedFn);
    return () => {
      this.removeEventListener(name, wrappedFn);
    };
  };

  public send = (messageObj: MessageObj) => {
    this.broadcast(messageObj);
  };

  public forward = (message: string, newRecipient: string) => {
    return this.listen(message, (messageObj) => {
      this.broadcast({
        ...messageObj,
        to: newRecipient,
      });
    });
  };
}

export default Relay;
