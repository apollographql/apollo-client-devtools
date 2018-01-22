import React, { Component } from "react";
import classnames from "classnames";

import WatchedQueries from "./WatchedQueries";
import Mutations from "./Mutations";
import Explorer from "./Explorer";
import Inspector from "./Inspector";
import Logger from "./Logger";
import { Sidebar } from "./Sidebar";

import Apollo from "./Images/Apollo";
import GraphQL from "./Images/GraphQL";
import Store from "./Images/Store";
import Queries from "./Images/Queries";

import "../style.less";

export default class Panel extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      active: "graphiql",
      tabData: undefined,
      runQuery: undefined,
      runVariables: undefined,
      selectedRequestId: undefined,
      automaticallyRunQuery: undefined,
    };
  }

  componentWillUnmount() {
    clearTimeout(this._interval);
  }

  selectedApolloLog = () => (!this.state.tabData ? {} : this.state.tabData);

  onRun = (queryString, variables, tab, automaticallyRunQuery) => {
    ga("send", "event", tab, "run-in-graphiql");
    this.setState({
      active: "graphiql",
      runQuery: queryString,
      runVariables: variables ? JSON.stringify(variables, null, 2) : "",
      automaticallyRunQuery,
    });
  };

  switchPane = pane => {
    this.setState({
      active: pane,
      // Don't leave this stuff around except when actively clicking the run
      // button.
      runQuery: undefined,
      runVariables: undefined,
    });
  };

  selectLogItem = id => this.setState({ selectedRequestId: id });

  render() {
    const { active } = this.state;
    const selectedLog = this.selectedApolloLog();
    let body;
    switch (active) {
      case "queries":
        // XXX this won't work in the dev tools (probably does work now)
        body = selectedLog && (
          <WatchedQueries state={selectedLog.state} onRun={this.onRun} />
        );
        break;
      case "mutations":
        // XXX this won't work in the dev tools (probably does work now)
        body = selectedLog && (
          <Mutations state={selectedLog.state} onRun={this.onRun} />
        );
        break;
      case "store":
        body = selectedLog && <Inspector state={selectedLog.state} />;
        break;
      case "graphiql":
        body = (
          <Explorer
            query={this.state.runQuery}
            variables={this.state.runVariables}
            automaticallyRunQuery={this.state.automaticallyRunQuery}
          />
        );
        break;
      case "logger":
        body = (
          <Logger
            onSelectLogItem={this.selectLogItem}
            selectedId={this.state.selectedRequestId}
          />
        );
        break;
      default:
        break;
    }

    return (
      <div
        className={classnames(
          "apollo-client-panel",
          { "in-window": !chrome.devtools },
          chrome.devtools && chrome.devtools.panels.themeName
        )}
      >
        <Sidebar className="tabs" name="nav-tabs">
          <div className="tab logo-tab">
            <Apollo />
          </div>
          <div
            title="GraphiQL console"
            className={classnames("tab", { active: active === "graphiql" })}
            onClick={() => this.switchPane("graphiql")}
          >
            <GraphQL />
            <div>GraphiQL</div>
          </div>
          <div
            title="Watched queries"
            className={classnames("tab", { active: active === "queries" })}
            onClick={() => this.switchPane("queries")}
          >
            <Queries />
            <div>Queries</div>
          </div>

          <div
            title="Watched mutations"
            className={classnames("tab", { active: active === "mutations" })}
            onClick={() => this.switchPane("mutations")}
          >
            <Queries />
            <div>Mutations</div>
          </div>
          <div
            title="Apollo client store"
            className={classnames("tab", { active: active === "store" })}
            onClick={() => this.switchPane("store")}
          >
            <Store />
            <div>Store</div>
          </div>
        </Sidebar>
        {body}
      </div>
    );
  }
}
