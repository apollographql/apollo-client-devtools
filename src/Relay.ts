/* 
  The native EventTarget interface is not useable in content scripts in Firefox. 
  We import and extend from a shim to use the functionality we need.
*/
import { EventTarget } from 'event-target-shim';
import { CustomEventListener, MessageObj } from './types';
class Relay extends EventTarget {
  private connections = new Map<string, (event: CustomEvent<MessageObj>) => ReturnType<CustomEventListener>>();

  public addConnection = (name: string, fn: (message: MessageObj) => void) => {
    function wrappedFn(event: CustomEvent<MessageObj>) { 
      return fn(event.detail); 
    };

    this.addEventListener(name, wrappedFn);
    this.connections.set(name, wrappedFn);

    return () => this.removeConnection(name);
  }

  public removeConnection = (name: string) => {
    const fn = this.connections.get(name);
    if (fn) {
      this.removeEventListener(name, fn);
      this.connections.delete(name);
    }
  }

  private dispatch(message: CustomEvent) {
    this.dispatchEvent(message);
  }

  private createEvent(message: string) {
    return new CustomEvent(message, { detail: {} });
  }

  public broadcast = (message: MessageObj) => {
    let event = this.createEvent(message.message);
    
    if (message?.to) {
      let destination = message.to;
      event.detail['to'] = destination;
      let nextDestination: string | undefined;
      let remaining: string[];
      
      // If there are intermediate destinations
      // Example: 'background:tab:window'
      if (destination.includes(':')) {
        [destination, ...remaining] = message.to.split(':');
        nextDestination = remaining.join(':');
      }

      if (this.connections.has(destination)) {
        event = this.createEvent(destination);
        event.detail['to'] = nextDestination;
      }
    }

    event.detail['message'] = message.message;
    event.detail['payload'] = message.payload;
    this.dispatch(event);
  }

  public listen = <T = any>(name: string, fn: CustomEventListener<T>) => {
    function wrappedFn(event: CustomEvent<MessageObj<T>>) { 
      return fn(event.detail); 
    };

    this.addEventListener(name, wrappedFn);
    return () => {
      this.removeEventListener(name, wrappedFn);
    }
  }

  public send = (messageObj: MessageObj) => {
    this.broadcast(messageObj);
  }

  public forward = (message: string, newRecipient: string)  => {
    return this.listen(message, messageObj => {
      this.broadcast({
        ...messageObj,
        to: newRecipient,
      });
    });
  }
}

export default Relay;
