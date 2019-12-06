import React, { Component } from "react";
import Navigation from './navigation';

class App extends Component {
  render() {
    /* TODO: figure out how to handle application state. mocking for now. */
    const mockApplicationState = {
      numberOfQueries: 6,
      numberOfMutations: 2
    };

    return (
      <div>
        <Navigation client={mockApplicationState} />
      </div>
    )
  }
}

export default App;
