import React, { Component } from "react";

const ExecuteButton = () => <div>ExecuteButton</div>;
const GraphiQLEditor = () => <div>GraphiQLEditor</div>;
const DocExplorer = () => <div>DocExplorer</div>;

export default class GraphiQL extends Component {
  render() {
    return (this.props as any).render({
      ExecuteButton,
      GraphiQLEditor,
      DocExplorer,
    });
  }
}
