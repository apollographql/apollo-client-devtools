import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { ApolloClient, InMemoryCache, ApolloProvider, makeReference } from '@apollo/client';

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Color: {
        keyFields: ["hex"],
        fields: {
          saved: {
            read(_, { readField }) {
              const hex = readField("hex");
              const favoritedColors = readField("favoritedColors", makeReference("ROOT_QUERY"));
              return favoritedColors.some(colorRef => {
                return hex === readField("hex", colorRef);
              });
            }
          },
        }
      }
    },
  }),
  uri: 'http://localhost:4000',
});

createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
