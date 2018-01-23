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
      tabData: {},
      runQuery: undefined,
      runVariables: undefined,
      selectedRequestId: undefined,
      automaticallyRunQuery: undefined,
    };

    bridge.on("broadcast:initial", data => {
      if (!this.state.tabData.inspector) {
        const initial = JSON.parse(data);
        const last = initial[initial.length - 1];
        this.setState({ tabData: last });
      }
    });

    this.props.bridge.on("broadcast:new", _data => {
      const data = JSON.parse(_data);
      this.setState(({ tabData }) => ({
        tabData: Object.assign({}, tabData, data),
      }));
    });
  }

  componentWillUnmount() {
    clearTimeout(this._interval);
  }

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
    const { active, tabData } = this.state;
    let body;
    switch (active) {
      case "queries":
        // XXX this won't work in the dev tools (probably does work now)
        body = <WatchedQueries state={tabData} onRun={this.onRun} />;
        break;
      case "mutations":
        // XXX this won't work in the dev tools (probably does work now)
        body = <Mutations state={tabData} onRun={this.onRun} />;
        break;
      case "store":
        body = <Inspector state={tabData} />;
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
          { "in-window": !this.props.isChrome },
          this.props.theme
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
