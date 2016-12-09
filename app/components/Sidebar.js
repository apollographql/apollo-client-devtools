import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

export class Sidebar extends Component {
  constructor(props, context) {
    super(props, context);

    this.initResize = this.initResize.bind(this);
    this.Resize = this.Resize.bind(this);
    this.stopResize = this.stopResize.bind(this);
  }

  initResize(e) {
    window.addEventListener('mousemove', this.Resize, false);
    window.addEventListener('mouseup', this.stopResize, false);
  }

  Resize(e) {
    console.log(this.sidebar.offsetLeft);
    this.sidebar.style.width = (e.clientX - this.sidebar.offsetLeft) + 'px';
    window.getSelection().removeAllRanges();
  }

  stopResize(e) {
    window.removeEventListener('mousemove', this.Resize, false);
    window.removeEventListener('mouseup', this.stopResize, false);
  }

  render() {
    const { children } = this.props;
    return (
      <div className={classnames(this.props.className, 'sidebar')} ref={(sidebar) => { this.sidebar = sidebar; }}>
        <div className="dragger" onMouseDown={this.initResize} />
        {children}
      </div>
    );
  }
}
