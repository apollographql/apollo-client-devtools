import React, { Component } from "react";
import Navigation from './navigation';
import Queries from './queries';

class App extends Component {
  render() {
    /* TODO: figure out how to handle application state. mocking for now. */
    const mockClient = {
      queries: {
        'App__AuthQuery': {
          react: true
        },
        '': {},
        'CurrentAccountIdQuery': {},
        'UI__accountBillingEmailQuery': {
          react: true
        },
        'UI__AccountNavQuery': {},
        'User__PersonalSettingsQuery': {
          react: true
        }
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
