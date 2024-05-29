export class History<T> {
  private stack: T[] = [];
  private currentIndex = 0;
  private listeners = new Set<(value: T) => void>();

  constructor(initialValue: T) {
    this.stack.push(initialValue);
  }

  getCurrent = () => {
    return this.stack[this.currentIndex];
  };

  go = (delta: number) => {
    const previousIndex = this.currentIndex;
    this.currentIndex = Math.min(
      Math.max(0, this.currentIndex + delta),
      this.stack.length - 1
    );

    if (this.currentIndex !== previousIndex) {
      this.listeners.forEach((listener) => {
        listener(this.getCurrent());
      });
    }
  };

  back = () => {
    this.go(-1);
  };

  forward = () => {
    this.go(1);
  };

  canGoBack = () => {
    return this.currentIndex > 0;
  };

  canGoForward = () => {
    return this.currentIndex < this.stack.length - 1;
  };

  push = (value: T) => {
    this.stack.splice(this.currentIndex + 1);
    this.stack.push(value);
    this.forward();
  };

  listen = (listener: (value: T) => void) => {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  };
}
