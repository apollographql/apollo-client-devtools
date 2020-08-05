interface Message {
  to?: string
  message?: string
  payload?: any
}

interface CustomEventListener {
  (evt: CustomEvent): void;
}

class Relay extends EventTarget {
  private connections = new Map<string, (event: CustomEvent<Message>) => ReturnType<CustomEventListener>>();

  public addConnection = (name: string, fn: (message: Message) => void) => {
    function wrappedFn(event: CustomEvent<Message>) { 
      return fn(event.detail); 
    };

    this.addEventListener(name, wrappedFn);
    this.connections.set(name, wrappedFn);

    return () => this.removeConnection(name);
  }

  public removeConnection = (name: string) => {
    const fn = this.connections.get(name);
    this.removeEventListener(name, fn);
    this.connections.delete(name);
  }

  private dispatch(message: CustomEvent<Message>) {
    this.dispatchEvent(message);
  }

  private createEvent(message: string, detail: Message = {}) {
    return new CustomEvent(message, { detail });
  }

  public broadcast = (message: Message) => {
    let event = this.createEvent(message.message);
    
    if (message?.to) {
      let destination = message.to;
      event.detail.to = destination;
      let nextDestination: string;
      let remaining: string[];
      
      // If there are intermediate destinations
      // Example: 'background:tab:window'
      if (destination.includes(':')) {
        [destination, ...remaining] = message.to.split(':');
        nextDestination = remaining.join(':');
      }

      if (this.connections.has(destination)) {
        event = this.createEvent(destination);
        event.detail.to = nextDestination;
      }
    }

    event.detail.message = message.message;
    event.detail.payload = message.payload;
    this.dispatch(event);
  }

  public listen = (name: string, fn: CustomEventListener) => {
    this.addEventListener(name, fn);
    return () => {
      this.removeEventListener(name, fn);
    }
  }

  public send = (message: string, options: Message) => {
    this.broadcast({ message, ...options });
  }
}

export default Relay;
