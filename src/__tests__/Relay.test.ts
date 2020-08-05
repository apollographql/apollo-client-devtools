import Relay from '../Relay';

describe('Relay', () => {
  it('sends a message to a connection', () => {
    const relay = new Relay();
    const callback = jest.fn();
    relay.addConnection('Bedford Ave', callback);

    relay.send('The L train is delayed.', {
      to: 'Bedford Ave',
    });

    expect(callback).toBeCalledWith({ 
      message: 'The L train is delayed.', 
      to: undefined,
    });
  });

  it('sends the next destination to the connection', () => {
    const relay = new Relay();
    const callback = jest.fn();
    relay.addConnection('Bedford Ave', callback);

    relay.send('The L train is delayed.', {
      to: 'Bedford Ave:Lorimer St',
    });

    expect(callback).toBeCalledWith({ 
      message: 'The L train is delayed.', 
      to: 'Lorimer St'
    });
  });

  it('can remove a connection', () => {
    const relay = new Relay();
    const callback = jest.fn();
    relay.addConnection('Bedford Ave', callback);

    relay.send('The L train is delayed.', {
      to: 'Bedford Ave',
    });

    expect(callback).toBeCalledWith({ 
      message: 'The L train is delayed.', 
      to: undefined,
    });

    relay.removeConnection('Bedford Ave');

    relay.send('The L train is still delayed.', {
      to: 'Bedford Ave',
    });

    expect(callback).not.toBeCalledTimes(2);
  });

  it('can listen for a message', () => {
    const relay = new Relay();
    const callback = jest.fn();

    relay.listen('Train delayed.', callback);
    relay.broadcast({ message: 'Train delayed.' });

    expect(callback).toBeCalled();
  });

  it('returns a removeEventListener function', () => {
    const relay = new Relay();
    const callback = jest.fn();

    const removeEventListener = relay.listen('Train delayed.', callback);
    relay.broadcast({ message: 'Train delayed.' });

    expect(callback).toBeCalled();

    removeEventListener();

    relay.broadcast({ message: 'Train delayed.' });

    expect(callback).not.toBeCalledTimes(2);
  });
});