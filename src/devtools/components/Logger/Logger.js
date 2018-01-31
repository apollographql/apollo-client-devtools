import PropTypes from "prop-types";
import React from "react";
import { Sidebar } from "../Sidebar";
import classnames from "classnames";
import { parse } from "graphql/language/parser";
import { GraphqlCodeBlock } from "graphql-syntax-highlighter-react";
import "./Logger.less";

const queryLabel = action => {
  let label = "";

  if (action.type.startsWith("APOLLO_QUERY")) {
    label += "Q:" + action.queryId;

    if (action.type === "APOLLO_QUERY_INIT") {
      label += ":INIT";
    } else if (action.type === "APOLLO_QUERY_RESULT_CLIENT") {
      label += ":RES_CLIENT";
    } else if (action.type === "APOLLO_QUERY_RESULT") {
      label += ":RES";
    } else if (action.type === "APOLLO_QUERY_STOP") {
      label += ":STOP";
    }

    if (action.requestId) {
      label += `(${action.requestId})`;
    }
  } else if (action.type.startsWith("APOLLO_MUTATION")) {
    label += "M:" + action.mutationId;

    if (action.type === "APOLLO_MUTATION_INIT") {
      label += ":INIT";
    } else if (action.type === "APOLLO_MUTATION_RESULT") {
      label += ":RES";
    }
  } else if (action.type.startsWith("APOLLO_SUBSCRIPTION")) {
    label += "S:" + action.subscriptionId;
  } else {
    label += action.type;
  }

  return label;
};

class Logger extends React.Component {
  selectId(id) {
    if (this.props.selectedId !== id) {
      this.props.onSelectLogItem(id);
    } else {
      this.props.onSelectLogItem(null);
    }
  }

  renderSidebarItem(logEntry) {
    let className = "item";

    return (
      <div
        key={logEntry.id}
        onClick={() => this.selectId(logEntry.id)}
        className={classnames("item", {
          active: logEntry.id === this.props.selectedId,
        })}
      >
        {queryLabel(logEntry.action)}
      </div>
    );
  }

  getRequestByLogId(id) {
    const filtered = this.props.log.filter(l => l.id === id);
    if (filtered.length) {
      return filtered[0];
    }

    return null;
  }

  render() {
    const { selectedId } = this.props;
    let reqToDisplay = null;

    if (selectedId) {
      reqToDisplay = this.getRequestByLogId(selectedId);
    }

    return (
      <div className="Logger body">
        <Sidebar name="logger-sidebar">
          <div className="queries-sidebar-title">Request log</div>
          {this.props.log.map(logEntry => this.renderSidebarItem(logEntry))}
        </Sidebar>
        <div className="main">
          {reqToDisplay && (
            <RequestDetails request={reqToDisplay} onRun={this.props.onRun} />
          )}
        </div>
      </div>
    );
  }
}

Logger.propTypes = {
  log: PropTypes.array,
};

class LabeledShowHide extends React.Component {
  constructor(props, context) {
    super(props, context);
    const { show = true } = props;
    this.state = { show: true };
    this.toggle = this.toggle.bind(this);
  }
  toggle() {
    this.setState(({ show }) => ({ show: !show }));
  }
  render() {
    return (
      <div className={this.props.className}>
        <span onClick={this.toggle} className="toggle">
          {this.state.show ? <span>&#9662; </span> : <span>&#9656; </span>}
          {this.props.label}
        </span>
        {this.state.show && (
          <div className="labeled">{this.props.children}</div>
        )}
      </div>
    );
  }
}
LabeledShowHide.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  show: PropTypes.bool,
};

const Variables = ({ variables }) => {
  if (!variables) {
    return null;
  }
  const inner = [];
  Object.keys(variables)
    .sort()
    .forEach(name => {
      inner.push(<dt key={"dt" + name}>{name}</dt>);
      inner.push(<dd key={"dd" + name}>{JSON.stringify(variables[name])}</dd>);
    });
  return <dl>{inner}</dl>;
};

class RequestDetails extends React.Component {
  render() {
    const { request } = this.props;
    const action = request.action;

    if (!actionTypeToComponent[action.type]) {
      return <div>Unknown action type. Probably a bug in the dev tools.</div>;
    }

    return React.createElement(actionTypeToComponent[action.type], this.props);
  }
}

const QueryInit = ({ request }) => {
  const action = request.action;

  return (
    <table>
      <tr>
        <th>Type</th>
        <td>{action.type}</td>
      </tr>
      <tr>
        <th>Query ID</th>
        <td>{action.queryId}</td>
      </tr>
    </table>
  );
};

const actionTypeToComponent = {
  APOLLO_QUERY_INIT: QueryInit,
};

export default Logger;
