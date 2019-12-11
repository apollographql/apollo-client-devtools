import React, { Component } from "react";
import Navigation from './navigation';
import Queries from './queries';

class App extends Component {
  render() {
    /* TODO: figure out how to handle application state. mocking for now. */
    const mockClient = {
      queries: {
        'App__AuthQuery': {},
        'Unnamed query': {},
        'CurrentAccountIdQuery': {},
        'UI__accountBillingEmailQuery': {},
        'UI__AccountNavQuery': {},
        'User__PersonalSettingsQuery': {}
      },
      mutations: {}
    };

    const { queries, mutations } = mockClient;

    const numberOfQueries = Object.keys(queries).length;
    const numberOfMutations = Object.keys(mutations).length;

    return (
      <Navigation numberOfQueries={numberOfQueries} numberOfMutations={numberOfMutations}>
        <div>mock GRAPHIQL panel</div>
        <Queries queries={queries} />
        <div>mock MUTATIONS panel</div>
        <div>mock CACHE panel</div>
      </Navigation>
  )
  }
}

export default App;
