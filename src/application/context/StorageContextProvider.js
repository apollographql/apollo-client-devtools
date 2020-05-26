/* eslint-disable react/no-unused-state */
import React from "react";
import PropTypes from "prop-types";
import { StorageContext } from "./StorageContext";

export class StorageContextProvider extends React.PureComponent {
  state = {
    storage: this.props.storage,
  };

  render() {
    return (
      <StorageContext.Provider value={this.state}>
        {this.props.children}
      </StorageContext.Provider>
    );
  }
}

StorageContextProvider.propTypes = {
  storage: PropTypes.object.isRequired,
};
