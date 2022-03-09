import { ApolloClient, InMemoryCache } from '@apollo/client';
import { findClient } from '../hook';

const cache = new InMemoryCache();

describe('findClient', () => {
  beforeEach(() => {
    window.__APOLLO_CLIENT__ = undefined;
    window.document.body.innerHTML = ``;
  });

  it('should find the client on the provided window object', () => {
    const expectedClient = new ApolloClient({ cache });

    const client = findClient();
    expect(client).toEqual(expectedClient);
  });

  it('should find the client on an embedded iframe', () => {
    const expectedClient = new ApolloClient({ cache, connectToDevTools: false });

    const iframe = document.createElement('iframe');

    window.document.body.appendChild(iframe);

    iframe.contentWindow!.__APOLLO_CLIENT__ = expectedClient;

    const client = findClient();
    expect(client).toEqual(expectedClient);
  });

  it('should find the client in a nested iframe', () => {
    const expectedClient = new ApolloClient({ cache, connectToDevTools: false });

    const iframe = document.createElement('iframe');
    const nestedIframe = document.createElement('iframe');

    window.document.body.appendChild(iframe);

    iframe.contentDocument!.body.appendChild(nestedIframe);
    nestedIframe.contentWindow!.__APOLLO_CLIENT__ = expectedClient;

    const client = findClient();
    expect(client).toEqual(expectedClient);
  });

  it('should return undefined if no client instance is found', () => {
    const iframe = document.createElement('iframe');
    const nestedIframe = document.createElement('iframe');

    window.document.body.appendChild(iframe);
    iframe.contentDocument!.body.appendChild(nestedIframe);

    const client = findClient();
    expect(client).toBeUndefined();
  });
});