import React, { Component, Children } from "react";
import PropTypes from "prop-types";

export const BridgeConsumer = (props, context) =>
  props.children(context.bridge);

BridgeConsumer.contextTypes = {
  bridge: PropTypes.object.isRequired,
};

export const withBridge = Component => props => (
  <BridgeConsumer>
    {bridge => <Component bridge={bridge} {...props} />}
  </BridgeConsumer>
);

export class BridgeProvider extends Component {
  static propTypes = {
    bridge: PropTypes.object.isRequired,
    children: PropTypes.element.isRequired,
  };

  static childContextTypes = {
    bridge: PropTypes.object.isRequired,
  };

  getChildContext() {
    return {
      bridge: this.props.bridge,
    };
  }

  render() {
    return Children.only(this.props.children);
  }
}
