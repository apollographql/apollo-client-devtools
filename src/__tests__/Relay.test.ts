import Relay from '../Relay';

describe('Relay', () => {
  it('sends a message to a connection', () => new Promise(resolve => {
    const relay = new Relay();
    relay.addConnection('Bedford Ave', resolve);

    relay.send({
      message: 'The L train is delayed.',
      to: 'Bedford Ave',
    });
  }).then(result => {
    expect(result).toEqual({
      message: 'The L train is delayed.',
      to: undefined,
     });
  }));

  it('sends the next destination to the connection', () => new Promise(resolve => {
    const relay = new Relay();
    relay.addConnection('Bedford Ave', resolve);

    relay.send({
      message: 'The L train is delayed.',
      to: 'Bedford Ave:Lorimer St',
    });
  }).then(result => {
    expect(result).toEqual({
      message: 'The L train is delayed.',
      to: 'Lorimer St',
     });
  }));

  it('can remove a connection', () => new Promise((resolve, reject) => {
    const relay = new Relay();
    const callback = jest.fn(result => {
      try {
        expect(callback).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
          message: 'The L train is delayed.',
          to: undefined,
        });

        relay.removeConnection('Bedford Ave');
        // A second message will cause a test failure if the connection has not been removed.
        relay.send({
          message: 'The L train is delayed.',
          to: 'Bedford Ave',
        });

        // We set a short delay to allow the above to fail.
        setTimeout(resolve, 100);
      } catch (e) {
        reject(e);
      }
    });

    relay.addConnection('Bedford Ave', callback);

    relay.send({
      message: 'The L train is delayed.',
      to: 'Bedford Ave',
    });
  }));

  it('can listen for a message', () => new Promise(resolve => {
    const relay = new Relay();
    relay.listen('Train delayed.', resolve);
    relay.broadcast({ message: 'Train delayed.' });
  }).then(result => {
    expect(result).toEqual({ message: 'Train delayed.', payload: undefined });
  }));

  it('returns a removeEventListener function', () => new Promise((resolve, reject) => {
    const relay = new Relay();
    const callback = jest.fn(result => {
      try {
        expect(callback).toBeCalledTimes(1);
        expect(result).toEqual({ message: 'Train delayed.', payload: undefined });
        removeEventListener();
        // A second broadcast will cause a test failure if the listener has not been removed.
        relay.broadcast({ message: 'Train delayed.' });

        // We set a short delay to allow the above to fail.
        setTimeout(resolve, 1000);
      } catch(e) {
        reject(e);
      }
    });

    const removeEventListener = relay.listen('Train delayed.', callback);
    relay.broadcast({ message: 'Train delayed.' });
  }));

  it('can forward message to a connection', () => new Promise((resolve, reject) => {
    const TRAIN_DELAYED = 'Train delayed.';

    const L = new Relay();
    const G = new Relay();
    const A = new Relay();

    L.addConnection('G', message => G.broadcast(message));
    G.addConnection('A', message => A.broadcast(message));

    A.listen(TRAIN_DELAYED, message => {
      try {
        expect(message).toEqual({
          message: TRAIN_DELAYED,
          to: undefined,
          payload: 'delay',
        });

        resolve();
      } catch(e) { 
        reject(e); 
      }
    });

    G.forward(TRAIN_DELAYED, 'A');

    L.send({
      message: TRAIN_DELAYED,
      to: 'G',
      payload: 'delay',
    });
  }));
});