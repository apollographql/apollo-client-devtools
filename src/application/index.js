import React from "react";
import { render } from "react-dom";
import { ApolloClient, ApolloProvider, InMemoryCache, ApolloLink , useQuery, gql } from "@apollo/client";
// import Panel from './components/Panel';

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        queries() {
          return queriesVar();
        },
        mutations() {
          return mutationsVar();
        },
        cache() {
          return cacheVar();
        }
      }
    }
  }
});

const queriesVar = cache.makeVar(null);
const mutationsVar = cache.makeVar(null);
const cacheVar = cache.makeVar(null);

const client = new ApolloClient({
  link: ApolloLink.empty(),
  cache,
});

export const writeData = ({ queries, mutations, cache }) => {
  queriesVar(queries);
  mutationsVar(mutations);
  cacheVar(cache);
};

const GET_CACHE = gql`
  query GetCache {
    mutations @client
    queries @client
    cache @client
  }
`;

const App = () => {
  const { data, loading, error } = useQuery(GET_CACHE);
  return (<div>Hello, I am the Apollo Client Devtools.</div>)
};

export const initDevTools = () => {
  render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>, 
    document.getElementById("app")
  );
};
