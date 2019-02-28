import PropTypes from "prop-types";
import React, { Fragment } from "react";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import classnames from "classnames";

import SwitchIcon from "../Images/Switch";

export default class Switch extends React.Component {
  constructor(props) {
    super(props);
    this.state = { anchorEl: null };
  }

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleSelect = (id) => {
    this.props.onChange(id);
    this.handleClose();
  };

  renderActiveTitle() {
    const {data} = this.props;
    const activeItem = data.find(item => !!item.isSelected);
    return activeItem ? activeItem.name : 'Change Client';
  }

  render() {
    const {anchorEl} = this.state;
    const {data} = this.props;

    const isOpen = Boolean(anchorEl);
    return (
      <Fragment>
        <div
          title="Switch"
          className={classnames("tab", { active: false })}
          onClick={this.handleClick}
          aria-owns={open ? 'long-menu' : undefined}
          aria-haspopup="true"
        >
          <SwitchIcon />
          <h4>{this.renderActiveTitle()}</h4>
        </div>
        <Menu
          id="long-menu"
          open={isOpen}
          anchorEl={anchorEl}
          onClose={this.handleClose}
        >
          {
            data.map(({id, name, isSelected}) => {
              return (
                <MenuItem key={id} selected={isSelected} onClick={() => this.handleSelect(id)}>
                  {name}
                </MenuItem>
              );
            })
          }
        </Menu>
      </Fragment>
    );
  }
}

Switch.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
  })).isRequired,
  onChange: PropTypes.func.isRequired,
};