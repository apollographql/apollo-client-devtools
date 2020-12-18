import { MessageObj } from '../types';

export type EventListener<T = any> = (event: CustomEvent<MessageObj<T>>) => void;

class EventTarget {
  listeners = new Map<string, Set<EventListener>>();

  addEventListener(eventType: string, callback: EventListener) {
    const isRegistered = this.listeners.has(eventType);
    
    if (!isRegistered) {
      this.listeners.set(eventType, new Set<EventListener>());
    }

    const listeners = this.listeners.get(eventType);
    listeners!.add(callback);
  }

  removeEventListener(eventType: string, callback) {
    const isRegistered = this.listeners.has(eventType);

    if (isRegistered) {
      const listeners = this.listeners.get(eventType);
      listeners!.delete(callback);
    }
  }

  dispatchEvent(event: CustomEvent) {
    const isRegistered = this.listeners.has(event?.type);

    if (isRegistered) {
      const listeners = this.listeners.get(event.type);
      listeners!.forEach(listener => listener(event));
    }
  }
}

export default EventTarget;


