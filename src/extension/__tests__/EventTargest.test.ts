import EventTarget from '../EventTarget';

describe('EventTarget', () => {
  let eventTarget;
  beforeEach(() => {
    eventTarget = new EventTarget();
  });

  test('addEventListener', () => {
    const cb = jest.fn();
    eventTarget.addEventListener('test', cb);
    const event = new CustomEvent('test');

    eventTarget.dispatchEvent(event);
    expect(cb).toHaveBeenCalledWith(event);
  });

  test('it handles multiple listeners', () => {
    const cb1 = jest.fn();
    eventTarget.addEventListener('test', cb1);

    const cb2 = jest.fn();
    eventTarget.addEventListener('test', cb2);

    const event = new CustomEvent('test');
    eventTarget.dispatchEvent(event);
    expect(cb1).toHaveBeenCalledWith(event);
    expect(cb2).toHaveBeenCalledWith(event);
  });

  test('it handles duplicate listeners', () => {
    const cb1 = jest.fn();
    eventTarget.addEventListener('test', cb1);
    eventTarget.addEventListener('test', cb1);

    const event = new CustomEvent('test');
    eventTarget.dispatchEvent(event);
    expect(cb1).toBeCalledTimes(1);
  });

  test('removeEventListener', () => {
    const cb = jest.fn();
    eventTarget.addEventListener('test', cb);
    eventTarget.removeEventListener('test', cb);

    const event = new CustomEvent('test');
    eventTarget.dispatchEvent(event);
    expect(cb).not.toHaveBeenCalledWith(event);
  });
});