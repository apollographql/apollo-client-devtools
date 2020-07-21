import React from "react";
import { render } from "react-dom";
import { ApolloClient, ApolloProvider, InMemoryCache, ApolloLink } from "@apollo/client";

const client = new ApolloClient({
  link: ApolloLink.empty(),
  cache: new InMemoryCache(),
});

const App = () => (<div>Hello, I am the Apollo Client Devtools.</div>);

export const initDevTools = () => {
  render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>, 
    document.getElementById("app")
  );
};

export const writeToCache = (data, query) => {
  client.writeQuery({
    data,
    query,
  });
};
