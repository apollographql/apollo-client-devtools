import React, { Component } from "react";
import classnames from "classnames";

import WatchedQueries from "./WatchedQueries";
import Mutations from "./Mutations";
import Explorer from "./Explorer";
import Inspector from "./Inspector";
import { Sidebar } from "./Sidebar";

import Apollo from "./Images/Apollo";
import GraphQL from "./Images/GraphQL";
import Cache from "./Images/Store";
import Queries from "./Images/Queries";

import "../style.less";

const Shell = ({ children }) => (
  <div
    style={{
      backgroundImage:
        "linear-gradient(174deg,#1c2945 0,#2d4d5a 54%,#436a75 81%,#448b8e 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }}
  >
    <div style={{ maxWidth: "50%" }}>{children}</div>
  </div>
);

const UpgradeNotice = ({ version }) => (
  <Shell>
    <h1 style={{ color: "white" }}>Your Apollo Client needs updating!</h1>
    <h3 style={{ color: "white" }}>
      We&apos;ve detected your version of Apollo Client to be v{version}. The
      Apollo Devtools requires version 2.0.0 or greater. Luckily, upgrading is
      pretty painless and brings a whole bunch of new features! To learn how to
      upgrade, check out the migration guide{" "}
      <a
        style={{ color: "white" }}
        href="https://www.apollographql.com/docs/react/recipes/2.0-migration.html"
        target="_blank"
      >
        here!
      </a>
    </h3>
    <h3 style={{ color: "white" }}>
      To continue using the Devtools with v{version}, check out this guide to{" "}
      <a
        style={{ color: "white" }}
        href="https://github.com/apollographql/apollo-client-devtools/releases/tag/2.0.6"
        target="_blank"
      >
        using the previous version
      </a>
      .
    </h3>
  </Shell>
);

const Loading = () => (
  <Shell>
    <h2 style={{ color: "white" }}>Connecting to Apollo Client...</h2>
  </Shell>
);

const NotFound = () => (
  <Shell>
    <h1 style={{ color: "white" }}>
      We couldn't detect Apollo Client in your app!
    </h1>
    <h3 style={{ color: "white" }}>
      To use the Apollo Devtools, make sure that <code>connectToDevTools</code>{" "}
      is not disabled. To learn more about setting up Apollo Client to work with
      the Devtools, checkout this{" "}
      <a
        style={{ color: "white" }}
        href="https://github.com/apollographql/apollo-client-devtools#configuration"
        target="_blank"
      >
        link!
      </a>{" "}
      The Devtools are turned off by default when running in production. To
      manually turn them on, set <code>connectToDevTools</code> to be{" "}
      <code>true</code>
    </h3>
  </Shell>
);

export default class Panel extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      active: "graphiql",
      tabData: {},
      runQuery: undefined,
      runVariables: undefined,
      version: undefined,
      automaticallyRunQuery: undefined,
      // assume success
      notFound: false,
    };

    this.props.bridge.on("ready", version => {
      this.setState({ version, notFound: false });
      this.props.bridge.send("panel:ready", "ready");
    });

    this.props.bridge.on("broadcast:new", _data => {
      const data = JSON.parse(_data);
      if (data.counter) this.props.bridge.send("broadcast:ack", data.counter);
      this.setState(({ tabData }) => ({
        tabData: Object.assign({}, tabData, data),
        notFound: false,
      }));
    });
  }

  componentDidMount() {
    this._timeout = setTimeout(() => {
      if (this.state.version) return;
      this.setState({ notFound: true });
    }, 10000);
  }

  componentWillUnmount() {
    clearTimeout(this._timeout);
  }

  onRun = (queryString, variables, tab, automaticallyRunQuery) => {
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

  render() {
    const { active, tabData, version, notFound } = this.state;
    if (notFound) return <NotFound />;
    if (!version) return <Loading />;
    if (Number(version[0]) === 1) return <UpgradeNotice version={version} />;
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
            theme={this.props.theme}
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
          { "in-window": this.props.isChrome },
          this.props.theme,
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
            <h4>GraphiQL</h4>
          </div>
          <div
            title="Watched queries"
            className={classnames("tab", { active: active === "queries" })}
            onClick={() => this.switchPane("queries")}
          >
            <Queries />
            <h4>Queries</h4>
          </div>

          <div
            title="Watched mutations"
            className={classnames("tab", { active: active === "mutations" })}
            onClick={() => this.switchPane("mutations")}
          >
            <Queries />
            <h4>Mutations</h4>
          </div>
          <div
            title="Apollo client store"
            className={classnames("tab", { active: active === "store" })}
            onClick={() => this.switchPane("store")}
          >
            <Cache />
            <h4>Cache</h4>
          </div>
        </Sidebar>
        {body}
      </div>
    );
  }
}
