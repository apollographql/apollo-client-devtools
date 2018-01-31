import React from "react";
import { AppRegistry, View, StyleSheet } from "react-native-web";

import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "react-apollo";

import ExchangeRateView from "./view";
import { colors } from "./styles";

const client = new ApolloClient({
  link: new HttpLink({
    uri: `https://v7mnw3m03.lp.gql.zone/graphql`,
  }),
  cache: new InMemoryCache(),
});

const App = () => (
  <View style={styles.app}>
    <View style={styles.top}>
      <ApolloProvider client={client}>
        <ExchangeRateView />
      </ApolloProvider>
    </View>
  </View>
);

const styles = StyleSheet.create({
  app: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    alignContent: "stretch",
    height: "100vh",
  },
  top: {
    backgroundColor: colors.darkBlue,
    flex: 1,
    paddingTop: 20,
    paddingBottom: 40,
  },
  bottom: {
    flex: 1,
  },
});

AppRegistry.registerComponent("App", () => App);
AppRegistry.runApplication("App", { rootTag: document.getElementById("root") });
