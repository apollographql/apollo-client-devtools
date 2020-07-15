interface Message {
  to?: string
  id?: any
  message?:string
  payload?:any
  origin?:string
  sender?:string
}

type MessageOptions = {
  to?: string
  id?: any
  payload?:any
  origin?:string
  sender?:string
}

class Relay extends EventTarget {
  id;
  name;
  connections = new Map();

  constructor(name:string) {
    super();
    this.name = name;
    this.broadcast = this.broadcast.bind(this);
    this.send = this.send.bind(this);
    this.addConnection = this.addConnection.bind(this);
    this.removeConnection = this.removeConnection.bind(this);
    this.createEvent = this.createEvent.bind(this);
  }

  addConnection(name:string, fn:EventListener) {
    function wrappedFn(event:CustomEvent) { 
      return fn(event.detail); 
    };

    this.addEventListener(name, wrappedFn);
    this.connections.set(name, wrappedFn);

    return () => this.removeConnection(name);
  }

  removeConnection(name:string) {
    const fn:EventListener = this.connections.get(name);
    this.removeEventListener(name, fn);
    this.connections.delete(name);
  }

  dispatch(message) {
    console.log('dispatch', message);
    this.dispatchEvent(message);
  }

  createEvent(message:string, detail:Message = {}) {
    return new CustomEvent(message, { detail });
  }

  broadcast(message:Message, sender) {
    console.log(this.name, 'received ', message, ' from ', sender);
    let event = this.createEvent(message.message);
    
    if (message?.to) {
      let destination = message.to;
      event.detail.to = destination;
      let nextDestination;
      let remaining;

      // TODO: Handle multiple destinations
      // If there are multiple destinations
      // Example: ['background:tab', 'background:devtools'] -> send to both the tab and the devtools
      if (Array.isArray(destination)) {
        destination.forEach((to) => this.broadcast(
          {
            ...message,
            to,
          },
          sender
        ));

        return;
      }
      
      // If there are intermediate destinations
      // Example: 'background:tab:window' -> send the window connection from the tab connection
      if (destination.includes(':')) {
        [destination, ...remaining] = message.to.split(':');
        nextDestination = remaining.join(':');
      }

      let optionalId = message?.id ? `:${message.id}` : '';

      if (this.connections.has(`${destination}${optionalId}`)) {
        event = this.createEvent(`${destination}${optionalId}`);
        event.detail.to = nextDestination;
      }
    }

    if (!message.id && this.id) {
      event.detail.id = this.id;
    }

    event.detail.message = message.message;
    event.detail.origin = sender?.name; 
    event.detail.sender = sender;

    this.dispatch(event);
  }

  listen(name:string, fn:EventListener) {
    this.addEventListener(name, fn);
    return () => {
      this.removeEventListener(name, fn);
    }
  }

  send(message:string, options:MessageOptions) {
    this.broadcast({ message, ...options }, this.name);
  }
}

export default Relay;

// TODO: Implement payloads
// TODO: Implement handshake on addConnection
// TODO: intercept(); Allows you to do something with the message before it goes to its destination